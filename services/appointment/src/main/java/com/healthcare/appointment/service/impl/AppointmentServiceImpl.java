package com.healthcare.appointment.service.impl;

import com.healthcare.appointment.client.DoctorServiceClient;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.Slot;
import com.healthcare.appointment.enums.AppointmentStatus;
import com.healthcare.appointment.enums.CancelledBy;
import com.healthcare.appointment.enums.ErrorCode;
import com.healthcare.appointment.enums.SlotStatus;
import com.healthcare.appointment.event.*;
import com.healthcare.appointment.exception.AppointmentException;
import com.healthcare.appointment.exception.SlotException;
import com.healthcare.appointment.mapper.AppointmentMapper;
import com.healthcare.appointment.mapper.SlotMapper;
import com.healthcare.appointment.payload.request.BookAppointmentRequest;
import com.healthcare.appointment.payload.request.CancelAppointmentRequest;
import com.healthcare.appointment.payload.request.ConfirmPaymentRequest;
import com.healthcare.appointment.payload.response.AppointmentResponse;
import com.healthcare.appointment.payload.response.SlotResponse;
import com.healthcare.appointment.publisher.AppointmentEventPublisher;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.repository.SlotRepository;
import com.healthcare.appointment.service.AppointmentService;
import com.healthcare.appointment.service.SlotLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final SlotLockService slotLockService;

    private final SlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;

    private final DoctorServiceClient doctorServiceClient;

    private final AppointmentEventPublisher eventPublisher;

    @Value("${app.appointment.cancellation-cutoff-hours}")
    private int cancellationCutoffHours;

    // TODO: This method returning a empty list even for valid request
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(String doctorId, String clinicId, LocalDate date) {
        log.debug("Fetching available slots. doctorId={}, clinicId={}, date={}", doctorId, clinicId, date);

        if (date.isBefore(LocalDate.now())) {
            log.warn("Reject slot fetch for past date - doctorId={}, clinicId={}, date={} ",
                    doctorId, clinicId, date);
            throw new AppointmentException(ErrorCode.INVALID_SLOT_DATE,
                    "Cannot fetch slots for a past date. Please select today or a future date.");
        }

        long startTime = System.currentTimeMillis();

        try {
            List<Slot> slots = slotRepository
                    .findByDoctorIdAndClinicIdAndSlotDateAndStatusOrderByStartTimeAsc(
                            doctorId, clinicId, date, SlotStatus.AVAILABLE
                    );

            long duration = System.currentTimeMillis() - startTime;
            log.info("Available slots retrieved. count={}, doctorId={}, duration={}ms",
                    slots.size(), doctorId, duration);

            return slots.stream().map(SlotMapper::toSlotResponse).toList();

        } catch (Exception e) {
            log.error("Failed to retrieve available slots. doctorId={}, clinicId={}, date={}, error={}",
                    doctorId, clinicId, date, e.getMessage(), e);
            throw e;
        }
    }

    // SAGA Step 1 — Book appointment
    @Override
    @Transactional
    public AppointmentResponse bookAppointment(String patientId,
                                               BookAppointmentRequest request
    ) {
        String slotId = request.slotId();
        log.info("Attempting to book appointment. patientId: {}, slotId: {}", patientId, slotId);

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> {
                    log.warn("Booking failed, Slot not found. slotId: {}, patientId: {}", slotId, patientId);
                    return new SlotException(ErrorCode.SLOT_NOT_AVAILABLE);
                });

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            log.warn("Booking failed, Slot status is {}. slotId: {}, patientId: {}", slot.getStatus(), slotId, patientId);
            throw new SlotException(ErrorCode.SLOT_NOT_AVAILABLE, "Slot is no longer available");
        }

        log.debug("Acquiring lock for slotId: {} for patientId: {}", slotId, patientId);
        boolean lockAcquired = slotLockService.acquireLock(slot.getId(), patientId);

        if (!lockAcquired) {
            log.info("Booking conflict: Could not acquire lock. slotId: {}, patientId: {}", slotId, patientId);
            throw new SlotException(
                    ErrorCode.SLOT_NOT_AVAILABLE,
                    "Slot is being booked by another patient. Please try another slot."
            );
        }

        try {
            log.debug("Fetching consultation fees from DoctorService. clinicId: {}", slot.getClinicId());
            long startTime = System.currentTimeMillis();
            BigDecimal consultationFees = doctorServiceClient.getClinicFees(slot.getClinicId());
            log.debug("Fetched fees: {} in {}ms", consultationFees, (System.currentTimeMillis() - startTime));

            slot.setStatus(SlotStatus.LOCKED);
            slotRepository.save(slot);

            Appointment appointment = Appointment.builder()
                    .slotId(slot.getId())
                    .patientId(patientId)
                    .doctorId(slot.getDoctorId())
                    .clinicId(slot.getClinicId())
                    .appointmentDate(slot.getSlotDate())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .consultationFees(consultationFees)
                    .build();

            appointment = appointmentRepository.save(appointment);
            log.info("Appointment successfully created. appointmentId: {}, patientId: {}, slotId: {}",
                    appointment.getId(), patientId, slotId);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (OptimisticLockingFailureException e) {
            log.error("Optimistic lock failure during booking. slotId: {}, patientId: {}", slotId, patientId);
            slotLockService.releaseLock(slot.getId(), patientId);
            throw new SlotException(ErrorCode.SLOT_NOT_AVAILABLE, "Slot was just taken");
        } catch (Exception e) {
            log.error("Unexpected error during appointment booking. patientId: {}, slotId: {}, error: {}",
                    patientId, slotId, e.getMessage(), e);
            slotLockService.releaseLock(slot.getId(), patientId);
            throw e;
        }
    }

    // SAGA Step 2a — Confirm payment
    @Override
    @Transactional
    public AppointmentResponse confirmPayment(ConfirmPaymentRequest request) {
        String appointmentId = request.appointmentId();
        String paymentId = request.paymentId();

        log.info("Processing payment confirmation. appointmentId={}, paymentId={}", appointmentId, paymentId);

        Appointment appointment = findAppointmentById(request.appointmentId());

        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
            log.warn("Payment confirmation rejected: Invalid state. appointmentId={}, currentStatus={}, paymentId={}",
                    appointmentId, appointment.getStatus(), paymentId);
            throw new IllegalStateException(
                    "Appointment is not in PENDING_PAYMENT state: " + appointment.getStatus());
        }

        // Update appointment
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPaymentId(paymentId);
        appointmentRepository.save(appointment);
        log.debug("Appointment state updated to CONFIRMED. appointmentId={}", appointmentId);

        slotRepository.findById(appointment.getSlotId()).ifPresentOrElse(
                slot -> {
                    slot.setStatus(SlotStatus.BOOKED);
                    slotRepository.save(slot);
                    log.debug("Slot status updated to BOOKED. slotId={}, appointmentId={}", slot.getId(), appointmentId);
                },
                () -> {
                    log.error("DATA INTEGRITY ERROR: Slot not found for confirmed appointment. slotId={}, appointmentId={}",
                            appointment.getSlotId(), appointmentId);
                }
        );

        log.debug("Releasing slot lock. slotId={}, patientId={}", appointment.getSlotId(), appointment.getPatientId());
        slotLockService.releaseLock(appointment.getSlotId(), appointment.getPatientId());

        // Publish event
        AppointmentConfirmedEvent event = buildBaseEvent(new AppointmentConfirmedEvent(), appointment);
        event.setPaymentId(paymentId);
        event.setConsultationFees(appointment.getConsultationFees());

        log.debug("Publishing AppointmentConfirmedEvent. appointmentId={}", appointmentId);
        eventPublisher.publishConfirmed(event);

        log.info("Appointment successfully confirmed. appointmentId={}, slotId={}, paymentId={}",
                appointmentId, appointment.getSlotId(), paymentId);

        return AppointmentMapper.toAppointmentResponse(appointment);
    }

    // SAGA Step 2b — Cancel via timeout (compensating transaction)
    @Override
    @Transactional
    public void cancelDueToTimeout(String appointmentId) {
        log.info("System timeout triggered for appointmentId={}", appointmentId);

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
                log.info("Cancellation skipped: Appointment no longer in PENDING_PAYMENT. appointmentId={}, currentStatus={}",
                        appointmentId, appointment.getStatus());
                return;
            }

            log.debug("Executing performCancellation for appointmentId={}", appointmentId);
            performCancellation(appointment, "Payment timeout", CancelledBy.SYSTEM, false);

            AppointmentPaymentFailedEvent event = buildBaseEvent(new AppointmentPaymentFailedEvent(), appointment);
            event.setFailureReason("Payment window expired");

            log.debug("Publishing PaymentFailed event due to timeout. appointmentId={}", appointmentId);
            eventPublisher.publishPaymentFailed(event);

            log.info("Successfully cancelled appointment due to timeout. appointmentId={}, slotId={}",
                    appointmentId, appointment.getSlotId());

        } catch (Exception e) {
            log.error("Critical failure during timeout cancellation. appointmentId={}, error={}",
                    appointmentId, e.getMessage(), e);
            // Re-throw if you want the transaction to roll back or the message queue to retry
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(String appointmentId,
                                                 String requesterId,
                                                 CancelledBy cancelledBy,
                                                 CancelAppointmentRequest request) {
        log.info("Cancellation request received. appointmentId={}, requesterId={}, cancelledBy={}, reason={}",
                appointmentId, requesterId, cancelledBy, request.reason());

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            validateRequesterOwnership(appointment, requesterId, cancelledBy);
            validateCancellableStatus(appointment);

            if (cancelledBy == CancelledBy.PATIENT) {
                validateCancellationWindow(appointment);
            }

            boolean wasConfirmed = appointment.getStatus() == AppointmentStatus.CONFIRMED;

            log.info("Executing cancellation logic. appointmentId={}, wasConfirmed={}, refundRequired={}",
                    appointmentId, wasConfirmed, wasConfirmed);

            performCancellation(appointment, request.reason(), cancelledBy, wasConfirmed);

            AppointmentCancelledEvent event = buildBaseEvent(new AppointmentCancelledEvent(), appointment);
            event.setCancellationReason(request.reason());
            event.setCancelledBy(cancelledBy);
            event.setRefundRequired(wasConfirmed);

            log.debug("Publishing AppointmentCancelledEvent. appointmentId={}, refundRequired={}",
                    appointmentId, wasConfirmed);
            eventPublisher.publishCancelled(event);

            log.info("Appointment successfully cancelled. appointmentId={}, slotId={}, cancelledBy={}",
                    appointmentId, appointment.getSlotId(), cancelledBy);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Cancellation rejected due to business rule. appointmentId={}, requesterId={}, reason={}",
                    appointmentId, requesterId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during appointment cancellation. appointmentId={}, requesterId={}, error={}",
                    appointmentId, requesterId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentResponse completeAppointment(String appointmentId, String doctorId) {
        log.info("Attempting to complete appointment. appointmentId={}, doctorId={}", appointmentId, doctorId);

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            // Validation Warning - Doctor Mismatch
            if (!appointment.getDoctorId().equals(doctorId)) {
                log.warn("Appointment completion unauthorized. appointmentId={}, requesterDoctorId={}, ownerDoctorId={}",
                        appointmentId, doctorId, appointment.getDoctorId());
                throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND, "Appointment not found for this doctor");
            }

            // Validation Warning - State Mismatch
            if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
                log.warn("Appointment completion rejected: Invalid status. appointmentId={}, status={}",
                        appointmentId, appointment.getStatus());
                throw new IllegalStateException("Only CONFIRMED appointments can be marked complete");
            }

            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
            log.debug("Database updated: status changes from CONFIRMED to COMPLETED. appointmentId={}", appointmentId);

            log.debug("Publishing AppointmentCompletedEvent. appointmentId={}", appointmentId);
            eventPublisher.publishCompleted(buildBaseEvent(new AppointmentCompletedEvent(), appointment));

            log.info("Appointment completed successfully. appointmentId={}, doctorId={}", appointmentId, doctorId);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (AppointmentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            // Technical Failure Log - Catching things like DB timeouts or network blips
            log.error("Failed to complete appointment due to system error. appointmentId={}, doctorId={}, error={}",
                    appointmentId, doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentResponse markNoShow(String appointmentId, String doctorId) {
        log.info("Processing No-Show status. appointmentId={}, doctorId={}", appointmentId, doctorId);

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            if (!appointment.getDoctorId().equals(doctorId)) {
                log.warn("No-Show rejected: Doctor mismatch. appointmentId={}, requesterId={}, ownerId={}",
                        appointmentId, doctorId, appointment.getDoctorId());
                throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND, "Appointment not found for this doctor");
            }

            // State Validation
            if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
                log.warn("No-Show rejected: Invalid status. appointmentId={}, currentStatus={}", appointmentId, appointment.getStatus());
                throw new IllegalStateException("Only CONFIRMED appointments can be marked as no-show");
            }

            // Trace the state transition
            AppointmentStatus previousStatus = appointment.getStatus();
            appointment.setStatus(AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appointment);
            log.debug("Updated status: {} -> {}. appointmentId={}", previousStatus, AppointmentStatus.NO_SHOW, appointmentId);

            // Event Tracing
            log.debug("Publishing NoShow event. appointmentId={}", appointmentId);
            eventPublisher.publishNoShow(buildBaseEvent(new AppointmentNoShowEvent(), appointment));

            log.info("Appointment marked as NO_SHOW. appointmentId={}, doctorId={}, patientId={}",
                    appointmentId, doctorId, appointment.getPatientId());

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (AppointmentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Critical failure marking No-Show. appointmentId={}, doctorId={}, error={}",
                    appointmentId, doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPatientHistory(String patientId, int page, int size) {
        log.debug("Fetching patient appointment history. patientId={}, page={}, size={}",
                patientId, page, size);

        long startTime = System.currentTimeMillis();

        try {
            Page<Appointment> appointmentPage = appointmentRepository
                    .findByPatientIdOrderByAppointmentDateDesc(
                            patientId, PageRequest.of(page, size));

            long duration = System.currentTimeMillis() - startTime;

            log.info("Retrieved patient history. patientId={}, totalElements={}, totalPages={}, currentPage={}, duration={}ms",
                    patientId, appointmentPage.getTotalElements(), appointmentPage.getTotalPages(), page,
                    duration);

            return appointmentPage.map(AppointmentMapper::toAppointmentResponse);

        } catch (Exception e) {
            log.error("Failed to retrieve patient history. patientId={}, page={}, size={}, error={}",
                    patientId, page, size, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorTodayAppointments(String doctorId) {
        LocalDate today = LocalDate.now();

        log.debug("Fetching today's schedule. doctorId={}, date={}", doctorId, today);

        long startTime = System.currentTimeMillis();

        try {
            List<Appointment> appointments = appointmentRepository
                    .findByDoctorIdAndAppointmentDateAndStatusNotOrderByStartTimeAsc(
                            doctorId, today, AppointmentStatus.CANCELLED);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Retrieved today's schedule. doctorId={}, appointmentCount={}, duration={}ms",
                    doctorId, appointments.size(), duration);

            return appointments.stream()
                    .map(AppointmentMapper::toAppointmentResponse)
                    .toList();

        } catch (Exception e) {
            log.error("Failed to retrieve today's appointments. doctorId={}, date={}, error={}",
                    doctorId, today, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getDoctorHistory(String doctorId, int page, int size) {
        log.debug("Fetching doctor appointment history. doctorId={}, page={}, size={}",
                doctorId, page, size);

        long startTime = System.currentTimeMillis();

        try {
            Page<Appointment> appointmentPage = appointmentRepository
                    .findByDoctorIdOrderByAppointmentDateDesc(
                            doctorId,
                            PageRequest.of(page, size, Sort.by("appointmentDate").descending())
                    );

            long duration = System.currentTimeMillis() - startTime;

            log.info("Doctor history retrieved. doctorId={}, totalElements={}, totalPages={}, duration={}ms",
                    doctorId, appointmentPage.getTotalElements(), appointmentPage.getTotalPages(),
                    duration);

            return appointmentPage.map(AppointmentMapper::toAppointmentResponse);

        } catch (Exception e) {
            log.error("Failed to fetch doctor history. doctorId={}, requestedPage={}, error={}",
                    doctorId, page, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(String appointmentId) {
        log.debug("Fetching appointment details. appointmentId={}", appointmentId);
        long startTime = System.currentTimeMillis();

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            long duration = System.currentTimeMillis() - startTime;

            log.debug("Appointment retrieved. appointmentId={}, status={}, patientId={}, duration={}ms",
                    appointmentId, appointment.getStatus(), appointment.getPatientId(), duration);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (Exception e) {
            log.error("Failed to retrieve appointment. appointmentId={}, error={}",
                    appointmentId, e.getMessage(), e);
            throw e;
        }
    }

    // Private helpers

    /**
     * Builds common base fields for ALL appointment events
     */
    private <T extends AppointmentEvent> T buildBaseEvent(T event, Appointment appointment) {
        event.setEventId(UUID.randomUUID().toString());
        event.setAppointmentId(appointment.getId());
        event.setPatientId(appointment.getPatientId());
        event.setDoctorId(appointment.getDoctorId());
        event.setClinicId(appointment.getClinicId());
        event.setAppointmentDate(appointment.getAppointmentDate());
        event.setStartTime(appointment.getStartTime());
        event.setOccurredAt(Instant.now());
        return event;
    }

    /**
     * Shared cancellation logic used by patient cancel, doctor cancel, and SAGA
     */
    private void performCancellation(Appointment appointment, String reason,
                                     CancelledBy cancelledBy, boolean wasConfirmed) {
        appointment.setStatus(wasConfirmed
                ? AppointmentStatus.REFUND_INITIATED
                : AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setCancelledBy(cancelledBy);
        appointmentRepository.save(appointment);

        slotRepository.findById(appointment.getSlotId()).ifPresentOrElse(
                slot -> {
                    slot.setStatus(SlotStatus.AVAILABLE);
                    slotRepository.save(slot);
                    log.debug("Slot marked as AVAILABLE. slotId={}", slot.getId());
                },
                () -> log.error("Slot not found during cancellation. slotId={}", appointment.getSlotId())
        );

        slotLockService.releaseLock(appointment.getSlotId(), appointment.getPatientId());
    }

    /**
     * Validates the ownership of the requester for the given appointment
     */
    private void validateRequesterOwnership(Appointment appointment, String requesterId, CancelledBy cancelledBy) {
        if (cancelledBy == CancelledBy.PATIENT && !appointment.getPatientId().equals(requesterId)) {
            log.warn("Ownership validation failed. requesterId={}, ownerId={}, type={}",
                    requesterId, appointment.getPatientId(), cancelledBy);
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND, "Appointment not found for this patient");
        }

        if (cancelledBy == CancelledBy.DOCTOR && !appointment.getDoctorId().equals(requesterId)) {
            log.warn("Ownership validation failed. requesterId={}, ownerId={}, type={}",
                    requesterId, appointment.getDoctorId(), cancelledBy);
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND, "Appointment not found for this doctor");
        }
    }

    /**
     * Validates appointment is in a cancellable state
     */
    private void validateCancellableStatus(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_CACELLABLE,
                    "Appointment cannot be cancelled in status: " + appointment.getStatus());
        }
    }

    /**
     * Validates patient is still within the cancellation window
     */
    private void validateCancellationWindow(Appointment appointment) {
        LocalDateTime appointmentDateTime = appointment.getAppointmentDate().atTime(appointment.getStartTime());
        LocalDateTime cutoff = appointmentDateTime.minusHours(cancellationCutoffHours);

        if (LocalDateTime.now().isAfter(cutoff)) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_CACELLABLE,
                    String.format("Appointment cannot be cancelled within %d hours of the scheduled time",
                            cancellationCutoffHours)
            );
        }
    }

    /**
     * Find an appointment by ID
     *
     * @param appointmentId the ID of the appointment to find
     * @return Appointment object
     */
    private Appointment findAppointmentById(String appointmentId) {
        return appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));
    }
}