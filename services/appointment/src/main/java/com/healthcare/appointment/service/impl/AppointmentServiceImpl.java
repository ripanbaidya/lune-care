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
import com.healthcare.appointment.schedular.AppointmentTimeoutScheduler;
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

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(String doctorId, String clinicId, LocalDate date) {
        log.debug("Fetching available slots. doctorId={}, clinicId={}, date={}", doctorId, clinicId, date);

        if (date.isBefore(LocalDate.now())) {
            log.warn("Slot fetch rejected for past date. doctorId={}, clinicId={}, date={}", doctorId, clinicId, date);
            throw new AppointmentException(ErrorCode.INVALID_SLOT_DATE,
                    "Cannot fetch slots for a past date. Please select today or a future date.");
        }

        long startTime = System.currentTimeMillis();

        try {
            List<Slot> slots = slotRepository
                    .findByDoctorIdAndClinicIdAndSlotDateAndStatusOrderByStartTimeAsc(
                            doctorId, clinicId, date, SlotStatus.AVAILABLE);

            log.info("Available slots retrieved. count={}, doctorId={}, duration={}ms",
                    slots.size(), doctorId, System.currentTimeMillis() - startTime);

            return slots.stream().map(SlotMapper::toSlotResponse).toList();

        } catch (Exception e) {
            log.error("Failed to retrieve available slots. doctorId={}, clinicId={}, date={}, error={}",
                    doctorId, clinicId, date, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * SAGA Step 1 — Lock slot + create appointment in PENDING_PAYMENT state.
     */
    @Override
    @Transactional
    public AppointmentResponse bookAppointment(String patientId, BookAppointmentRequest request) {
        String slotId = request.slotId();
        log.info("Booking attempt. patientId={}, slotId={}", patientId, slotId);

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> {
                    log.warn("Booking failed — slot not found. slotId={}", slotId);
                    return new SlotException(ErrorCode.SLOT_NOT_AVAILABLE);
                });

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            log.warn("Booking failed — slot not AVAILABLE. slotId={}, status={}", slotId, slot.getStatus());
            throw new SlotException(ErrorCode.SLOT_NOT_AVAILABLE, "Slot is no longer available");
        }

        boolean lockAcquired = slotLockService.acquireLock(slot.getId(), patientId);
        if (!lockAcquired) {
            log.info("Booking conflict — lock already held. slotId={}, patientId={}", slotId, patientId);
            throw new SlotException(ErrorCode.SLOT_NOT_AVAILABLE,
                    "Slot is being booked by another patient. Please try another slot.");
        }

        try {
            long fetchStart = System.currentTimeMillis();
            BigDecimal consultationFees = doctorServiceClient.getClinicFees(slot.getClinicId());
            log.debug("Fetched consultation fees={} in {}ms", consultationFees,
                    System.currentTimeMillis() - fetchStart);

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
            log.info("Appointment created. appointmentId={}, patientId={}, slotId={}",
                    appointment.getId(), patientId, slotId);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (OptimisticLockingFailureException e) {
            log.error("Optimistic lock failure during booking. slotId={}, patientId={}", slotId, patientId);
            slotLockService.releaseLock(slot.getId(), patientId);
            throw new SlotException(ErrorCode.SLOT_NOT_AVAILABLE, "Slot was just taken. Please try another slot.");

        } catch (Exception e) {
            log.error("Unexpected error during booking. patientId={}, slotId={}, error={}",
                    patientId, slotId, e.getMessage(), e);
            slotLockService.releaseLock(slot.getId(), patientId);
            throw e;
        }
    }

    /**
     * SAGA Step 2a — Confirm payment and activate appointment.
     * <p>
     * Idempotent: if already CONFIRMED, returns the current state without side effects.
     * Race-condition guard: if CANCELLED by the timeout scheduler before this call
     * arrives, throws so the payment-service rolls back its transaction — preventing
     * an orphaned captured payment.
     */
    @Override
    @Transactional
    public AppointmentResponse confirmPayment(ConfirmPaymentRequest request) {
        String appointmentId = request.appointmentId();
        String paymentId     = request.paymentId();

        log.info("Processing payment confirmation. appointmentId={}, paymentId={}", appointmentId, paymentId);

        Appointment appointment = findAppointmentById(appointmentId);

        // Idempotency: already confirmed — safe to return current state
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            log.info("Appointment already confirmed (idempotent call). appointmentId={}", appointmentId);
            return AppointmentMapper.toAppointmentResponse(appointment);
        }

        // Race condition: timeout scheduler cancelled the appointment before payment arrived
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            log.error("CRITICAL: Payment captured but appointment already CANCELLED by timeout. " +
                            "appointmentId={}, paymentId={}. Manual refund required.",
                    appointmentId, paymentId);
            throw new AppointmentException(ErrorCode.APPOINTMENT_ALREADY_CANCELLED,
                    "Appointment was cancelled before payment confirmation could be processed. " +
                            "Payment will be refunded. If you need help, please contact support.");
        }

        // Guard: must be PENDING_PAYMENT
        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
            log.warn("Payment confirmation rejected — invalid state. appointmentId={}, status={}, paymentId={}",
                    appointmentId, appointment.getStatus(), paymentId);
            throw new AppointmentException(ErrorCode.INVALID_APPOINTMENT_STATUS,
                    "Cannot confirm payment — appointment is not in PENDING_PAYMENT state: "
                            + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPaymentId(paymentId);
        appointmentRepository.save(appointment);
        log.debug("Appointment status updated to CONFIRMED. appointmentId={}", appointmentId);

        slotRepository.findById(appointment.getSlotId()).ifPresentOrElse(
                slot -> {
                    slot.setStatus(SlotStatus.BOOKED);
                    slotRepository.save(slot);
                    log.debug("Slot status updated to BOOKED. slotId={}", slot.getId());
                },
                () -> log.error("DATA INTEGRITY: Slot not found for confirmed appointment. slotId={}, appointmentId={}",
                        appointment.getSlotId(), appointmentId)
        );

        slotLockService.releaseLock(appointment.getSlotId(), appointment.getPatientId());

        AppointmentConfirmedEvent event = buildBaseEvent(new AppointmentConfirmedEvent(), appointment);
        event.setPaymentId(paymentId);
        event.setConsultationFees(appointment.getConsultationFees());
        eventPublisher.publishConfirmed(event);

        log.info("Appointment confirmed. appointmentId={}, slotId={}, paymentId={}",
                appointmentId, appointment.getSlotId(), paymentId);

        return AppointmentMapper.toAppointmentResponse(appointment);
    }

    /**
     * SAGA Step 2b — Cancel appointment stuck in PENDING_PAYMENT beyond the timeout window.
     * See {@link AppointmentTimeoutScheduler} for details.
     */
    @Override
    @Transactional
    public void cancelDueToTimeout(String appointmentId) {
        log.info("System timeout cancellation triggered. appointmentId={}", appointmentId);

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
                log.info("Timeout cancellation skipped — not in PENDING_PAYMENT. appointmentId={}, status={}",
                        appointmentId, appointment.getStatus());
                return;
            }

            performCancellation(appointment, "Payment timeout", CancelledBy.SYSTEM, false);

            AppointmentPaymentFailedEvent event = buildBaseEvent(new AppointmentPaymentFailedEvent(), appointment);
            event.setFailureReason("Payment window expired");
            eventPublisher.publishPaymentFailed(event);

            log.info("Appointment cancelled due to timeout. appointmentId={}, slotId={}",
                    appointmentId, appointment.getSlotId());

        } catch (Exception e) {
            log.error("Critical failure during timeout cancellation. appointmentId={}, error={}",
                    appointmentId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(String appointmentId,
                                                 String requesterId,
                                                 CancelledBy cancelledBy,
                                                 CancelAppointmentRequest request) {
        log.info("Cancellation request. appointmentId={}, requesterId={}, cancelledBy={}, reason={}",
                appointmentId, requesterId, cancelledBy, request.reason());

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            validateRequesterOwnership(appointment, requesterId, cancelledBy);
            validateCancellableStatus(appointment);

            if (cancelledBy == CancelledBy.PATIENT) {
                validateCancellationWindow(appointment);
            }

            boolean wasConfirmed = appointment.getStatus() == AppointmentStatus.CONFIRMED;

            performCancellation(appointment, request.reason(), cancelledBy, wasConfirmed);

            AppointmentCancelledEvent event = buildBaseEvent(new AppointmentCancelledEvent(), appointment);
            event.setCancellationReason(request.reason());
            event.setCancelledBy(cancelledBy);
            event.setRefundRequired(wasConfirmed);
            eventPublisher.publishCancelled(event);

            log.info("Appointment cancelled. appointmentId={}, slotId={}, cancelledBy={}",
                    appointmentId, appointment.getSlotId(), cancelledBy);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (AppointmentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during cancellation. appointmentId={}, requesterId={}, error={}",
                    appointmentId, requesterId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentResponse completeAppointment(String appointmentId, String doctorId) {
        log.info("Complete appointment request. appointmentId={}, doctorId={}", appointmentId, doctorId);

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            if (!appointment.getDoctorId().equals(doctorId)) {
                log.warn("Complete rejected — doctor mismatch. appointmentId={}, requesterId={}, ownerId={}",
                        appointmentId, doctorId, appointment.getDoctorId());
                throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND,
                        "Appointment not found for this doctor");
            }

            if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
                log.warn("Complete rejected — invalid status. appointmentId={}, status={}",
                        appointmentId, appointment.getStatus());
                throw new AppointmentException(ErrorCode.INVALID_APPOINTMENT_STATUS,
                        "Only CONFIRMED appointments can be marked as completed. Current status: "
                                + appointment.getStatus());
            }

            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);

            eventPublisher.publishCompleted(buildBaseEvent(new AppointmentCompletedEvent(), appointment));

            log.info("Appointment completed. appointmentId={}, doctorId={}", appointmentId, doctorId);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (AppointmentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to complete appointment. appointmentId={}, doctorId={}, error={}",
                    appointmentId, doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentResponse markNoShow(String appointmentId, String doctorId) {
        log.info("No-show request. appointmentId={}, doctorId={}", appointmentId, doctorId);

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            if (!appointment.getDoctorId().equals(doctorId)) {
                log.warn("No-show rejected — doctor mismatch. appointmentId={}, requesterId={}, ownerId={}",
                        appointmentId, doctorId, appointment.getDoctorId());
                throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND,
                        "Appointment not found for this doctor");
            }

            if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
                log.warn("No-show rejected — invalid status. appointmentId={}, status={}",
                        appointmentId, appointment.getStatus());
                throw new AppointmentException(ErrorCode.INVALID_APPOINTMENT_STATUS,
                        "Only CONFIRMED appointments can be marked as no-show. Current status: "
                                + appointment.getStatus());
            }

            appointment.setStatus(AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appointment);

            eventPublisher.publishNoShow(buildBaseEvent(new AppointmentNoShowEvent(), appointment));

            log.info("Appointment marked NO_SHOW. appointmentId={}, doctorId={}", appointmentId, doctorId);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (AppointmentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to mark no-show. appointmentId={}, doctorId={}, error={}",
                    appointmentId, doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPatientHistory(String patientId, int page, int size) {
        log.debug("Fetching patient history. patientId={}, page={}, size={}", patientId, page, size);

        long startTime = System.currentTimeMillis();

        try {
            Page<Appointment> appointmentPage = appointmentRepository
                    .findByPatientIdOrderByAppointmentDateDesc(patientId, PageRequest.of(page, size));

            log.info("Patient history retrieved. patientId={}, total={}, duration={}ms",
                    patientId, appointmentPage.getTotalElements(), System.currentTimeMillis() - startTime);

            return appointmentPage.map(AppointmentMapper::toAppointmentResponse);

        } catch (Exception e) {
            log.error("Failed to retrieve patient history. patientId={}, error={}", patientId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorTodayAppointments(String doctorId) {
        LocalDate today = LocalDate.now();
        log.debug("Fetching today's appointments. doctorId={}, date={}", doctorId, today);

        long startTime = System.currentTimeMillis();

        try {
            // Fetch only those appointments belongs to specified statueses
            List<Appointment> appointments = appointmentRepository
                    .findTodayAppointments(
                            doctorId, today,
                            List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW)
                    );

            log.info("Today's appointments retrieved. doctorId={}, count={}, duration={}ms",
                    doctorId, appointments.size(), System.currentTimeMillis() - startTime);

            return appointments.stream()
                    .map(AppointmentMapper::toAppointmentResponse)
                    .toList();

        } catch (Exception e) {
            log.error("Failed to retrieve today's appointments. doctorId={}, error={}", doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getDoctorHistory(String doctorId, int page, int size) {
        log.debug("Fetching doctor history. doctorId={}, page={}, size={}", doctorId, page, size);

        long startTime = System.currentTimeMillis();

        try {
            Page<Appointment> appointmentPage = appointmentRepository
                    .findByDoctorIdOrderByAppointmentDateDesc(
                            doctorId,
                            PageRequest.of(page, size, Sort.by("appointmentDate").descending()));

            log.info("Doctor history retrieved. doctorId={}, total={}, duration={}ms",
                    doctorId, appointmentPage.getTotalElements(), System.currentTimeMillis() - startTime);

            return appointmentPage.map(AppointmentMapper::toAppointmentResponse);

        } catch (Exception e) {
            log.error("Failed to fetch doctor history. doctorId={}, error={}", doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(String appointmentId) {
        log.debug("Fetching appointment. appointmentId={}", appointmentId);

        long startTime = System.currentTimeMillis();

        try {
            Appointment appointment = findAppointmentById(appointmentId);

            log.debug("Appointment retrieved. appointmentId={}, status={}, duration={}ms",
                    appointmentId, appointment.getStatus(), System.currentTimeMillis() - startTime);

            return AppointmentMapper.toAppointmentResponse(appointment);

        } catch (Exception e) {
            log.error("Failed to retrieve appointment. appointmentId={}, error={}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Releases a slot back to AVAILABLE after payment-service confirms the refund completed.
     * Called via internal endpoint POST /api/internal/appointment/{appointmentId}/release-slot
     */
    @Override
    @Transactional
    public void releaseSlotAfterRefund(String appointmentId) {
        log.info("Releasing slot after refund. appointmentId={}", appointmentId);
        Appointment appointment = findAppointmentById(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.REFUND_INITIATED) {
            log.warn("releaseSlotAfterRefund called on wrong status. appointmentId: {}, status: {}",
                    appointmentId, appointment.getStatus());
            return;
        }

        slotRepository.findById(appointment.getSlotId()).ifPresentOrElse(
                slot -> {
                    if (slot.getStatus() != SlotStatus.CANCELLED) {
                        log.warn("Slot not CANCELLED during refund release — skipping. slotId={}, status={}",
                                slot.getId(), slot.getStatus());
                        return;
                    }
                    slot.setStatus(SlotStatus.AVAILABLE);
                    slotRepository.save(slot);
                    log.info("Slot released to AVAILABLE after refund completed. slotId={}", slot.getId());
                },
                () -> log.error("Slot not found during refund release. slotId={}, appointmentId={}",
                        appointment.getSlotId(), appointmentId)
        );
    }

    // Private helpers

    /**
     * Shared cancellation logic for patient, doctor, and SAGA compensation (timeout).
     * Slot behavior:
     * {@code wasConfirmed=true}  → appointment becomes REFUND_INITIATED, slot becomes CANCELLED
     * (held until payment-service confirms refund via releaseSlotAfterRefund)
     * {@code wasConfirmed=false} → appointment becomes CANCELLED, slot immediately returns to AVAILABLE
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
                    // Hold slot, don't open until the refund is confirmed
                    if (wasConfirmed) {
                        slot.setStatus(SlotStatus.CANCELLED);
                        log.debug("Slot held as CANCELLED pending refund. slotId={}", slot.getId());
                    } else {
                        slot.setStatus(SlotStatus.AVAILABLE);
                        log.debug("Slot restored as AVAILABLE. slotId={}", slot.getId());
                    }

                    slotRepository.save(slot);
                },
                () -> log.error("Slot not found during cancellation. slotId={}", appointment.getSlotId())
        );

        slotLockService.releaseLock(appointment.getSlotId(), appointment.getPatientId());
    }

    private void validateRequesterOwnership(Appointment appointment, String requesterId, CancelledBy cancelledBy) {
        if (cancelledBy == CancelledBy.PATIENT && !appointment.getPatientId().equals(requesterId)) {
            log.warn("Ownership validation failed. requesterId={}, patientId={}", requesterId, appointment.getPatientId());
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND,
                    "Appointment not found for this patient");
        }
        if (cancelledBy == CancelledBy.DOCTOR && !appointment.getDoctorId().equals(requesterId)) {
            log.warn("Ownership validation failed. requesterId={}, doctorId={}", requesterId, appointment.getDoctorId());
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND,
                    "Appointment not found for this doctor");
        }
    }

    private void validateCancellableStatus(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_CANCELLABLE,
                    "Appointment cannot be cancelled in its current state: " + appointment.getStatus());
        }
    }

    private void validateCancellationWindow(Appointment appointment) {
        LocalDateTime appointmentDateTime = appointment.getAppointmentDate().atTime(appointment.getStartTime());
        LocalDateTime cutoff = appointmentDateTime.minusHours(cancellationCutoffHours);

        if (LocalDateTime.now().isAfter(cutoff)) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_NOT_CANCELLABLE,
                    String.format("Appointments cannot be cancelled within %d hour(s) of the scheduled time",
                            cancellationCutoffHours));
        }
    }

    private Appointment findAppointmentById(String appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));
    }

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
}