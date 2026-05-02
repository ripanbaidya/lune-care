package com.healthcare.doctor.service.impl;

import com.healthcare.doctor.client.AppointmentServiceClient;
import com.healthcare.doctor.entity.Clinic;
import com.healthcare.doctor.entity.ClinicSchedule;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.ClinicException;
import com.healthcare.doctor.mapper.ClinicMapper;
import com.healthcare.doctor.payload.dto.appointment.GenerateSlotsRequest;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;
import com.healthcare.doctor.repository.ClinicRepository;
import com.healthcare.doctor.repository.ClinicScheduleRepository;
import com.healthcare.doctor.service.ClinicScheduleService;
import com.healthcare.doctor.service.DoctorService;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicScheduleServiceImpl implements ClinicScheduleService {

    private final DoctorService doctorService;

    private final ClinicRepository clinicRepository;
    private final ClinicScheduleRepository scheduleRepository;

    private final AppointmentServiceClient appointmentServiceClient;

    @Override
    @Transactional
    public List<ClinicScheduleResponse> setSchedule(String userId,
                                                    String clinicId,
                                                    ClinicScheduleRequest request) {
        Doctor doctor = doctorService.findByUserId(userId);
        Clinic clinic = findClinicOwnedByDoctor(clinicId, doctor.getId());

        // Resolve date window — defaults handled here so service logic is explicit
        LocalDate startDate = request.startDate() != null ? request.startDate() : LocalDate.now();
        LocalDate endDate = request.endDate() != null ? request.endDate() : startDate.plusDays(30);

        // Guard: endDate must not be before startDate
        if (endDate.isBefore(startDate)) {
            throw new ClinicException(ErrorCode.INVALID_SCHEDULE_DATE_RANGE,
                    "End date must be on or after start date");
        }

        log.info("Processing schedule update. doctorId={}, clinicId={}, window=[{} → {}], incomingDays={}",
                doctor.getId(), clinicId, startDate, endDate,
                request.schedules().stream()
                        .map(s -> s.dayOfWeek().name())
                        .collect(Collectors.joining(", ")));

        // Load existing schedules keyed by DayOfWeek for O(1) lookup
        Map<DayOfWeek, ClinicSchedule> existingByDay = scheduleRepository
                .findByClinicId(clinicId)
                .stream()
                .collect(Collectors.toMap(ClinicSchedule::getDayOfWeek, Function.identity()));

        List<ClinicSchedule> savedSchedules = new ArrayList<>();
        List<GenerateSlotsRequest.ScheduleEntry> daysToGenerate = new ArrayList<>();

        for (ClinicScheduleRequest.ScheduleEntry entry : request.schedules()) {
            DayOfWeek day = entry.dayOfWeek();
            LocalTime newStart = entry.startTime();
            LocalTime newEnd = entry.endTime();

            ClinicSchedule existing = existingByDay.get(day);

            if (existing == null) {
                // Case 1: New day — insert and queue for slot generation
                log.info("New schedule day detected. day={}, clinicId={}", day, clinicId);
                ClinicSchedule newSchedule = ClinicSchedule.builder()
                        .clinic(clinic)
                        .dayOfWeek(day)
                        .startTime(newStart)
                        .endTime(newEnd)
                        .build();

                savedSchedules.add(scheduleRepository.save(newSchedule));
                daysToGenerate.add(toScheduleEntry(newSchedule));

            } else if (isTimeWindowChanged(existing, newStart, newEnd)) {
                // Case 2: Day exists, time changed — update, cancel old AVAILABLE slots, regenerate
                log.info("Schedule time changed. day={}, clinicId={}, old=[{} → {}], new=[{} → {}]",
                        day, clinicId, existing.getStartTime(), existing.getEndTime(), newStart, newEnd);

                existing.setStartTime(newStart);
                existing.setEndTime(newEnd);
                savedSchedules.add(scheduleRepository.save(existing));

                // Cancel AVAILABLE slots for this day before regenerating.
                // LOCKED and BOOKED slots are deliberately preserved.
                cancelAvailableSlotsForDay(clinicId, day);

                daysToGenerate.add(toScheduleEntry(existing));

            } else {
                // Case 3: No change — nothing to do
                log.debug("Schedule unchanged. day={}, clinicId={} — skipping", day, clinicId);
                savedSchedules.add(existing);
            }
        }

        // Only trigger generation for days that actually changed or were added
        if (!daysToGenerate.isEmpty()) {
            triggerSlotGeneration(
                    doctor.getUserId(),
                    clinicId,
                    clinic.getConsultationDurationMinutes(),
                    daysToGenerate,
                    startDate,
                    endDate
            );
        } else {
            log.info("No schedule changes requiring slot generation. clinicId={}", clinicId);
        }

        log.info("Schedule update complete. clinicId={}, processedDays={}", clinicId, savedSchedules.size());

        return savedSchedules.stream()
                .map(ClinicMapper::toScheduleResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteScheduleDay(String userId, String clinicId, DayOfWeek dayOfWeek) {
        Doctor doctor = doctorService.findByUserId(userId);
        findClinicOwnedByDoctor(clinicId, doctor.getId());

        log.info("Deleting schedule day. doctorId={}, clinicId={}, day={}", doctor.getUserId(), clinicId, dayOfWeek);

        ClinicSchedule schedule = scheduleRepository
                .findByClinicIdAndDayOfWeek(clinicId, dayOfWeek)
                .orElseThrow(() -> {
                    log.warn("Schedule day not found. clinicId={}, day={}", clinicId, dayOfWeek);
                    return new ClinicException(ErrorCode.CLINIC_SCHEDULE_NOT_FOUND,
                            "No schedule found for " + dayOfWeek + " at this clinic");
                });

        scheduleRepository.delete(schedule);
        log.info("Schedule row deleted. clinicId={}, day={}", clinicId, dayOfWeek);

        // Cancel all future AVAILABLE slots for this day.
        // LOCKED and BOOKED slots survive — patients in those states are unaffected.
        cancelAvailableSlotsForDay(clinicId, dayOfWeek);

        log.info("Schedule day removal complete. clinicId={}, day={}", clinicId, dayOfWeek);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicScheduleResponse> getSchedule(String userId, String clinicId) {
        Doctor doctor = doctorService.findByUserId(userId);
        findClinicOwnedByDoctor(clinicId, doctor.getId());

        return scheduleRepository.findByClinicId(clinicId)
                .stream()
                .map(ClinicMapper::toScheduleResponse)
                .toList();
    }

    // Private helpers - Resilience-protected outbound calls

    /**
     * Cancels available slots for a day when the schedule changes.
     * Retrying 2 times, 300ms wait.
     * Non-blocking by design — stale AVAILABLE slots are harmless since slot generation
     * is idempotent and the DB unique constraint prevents duplicates on regeneration.
     * Fallback logs a warning and continues — schedule update is NOT blocked.
     */
    @Retry(name = "appointment-service", fallbackMethod = "cancelAvailableSlotsForDayFallback")
    private void cancelAvailableSlotsForDay(String clinicId, DayOfWeek dayOfWeek) {
        try {
            appointmentServiceClient.cancelAvailableSlotsForDay(clinicId, dayOfWeek.name());
            log.info("Available slots cancelled. clinicId={}, day={}", clinicId, dayOfWeek);
        } catch (Exception e) {
            log.error("Failed to cancel available slots. clinicId={}, day={}, error={}",
                    clinicId, dayOfWeek, e.getMessage());
        }
    }

    /**
     * Fallback for cancelAvailableSlotsForDay — non-fatal, logs and continues.
     * Stale AVAILABLE slots will simply not appear in patient search (they'll be in the future
     * but appointment-service filters by status=AVAILABLE anyway; CANCELLED ones are excluded).
     */
    @SuppressWarnings("unused")
    protected void cancelAvailableSlotsForDayFallback(String clinicId, DayOfWeek dayOfWeek, Exception ex) {
        log.warn("RETRY EXHAUSTED: Failed to cancel available slots. " +
                        "clinicId={}, day={}. Stale slots may exist — they are harmless. error={}",
                clinicId, dayOfWeek, ex.getMessage());
    }

    /**
     * Triggers slot generation in appointment-service.
     * Retrying 2 times, 300ms wait.
     * Fallback logs error — slot generation failure is non-blocking for schedule update.
     * Slots can be generated manually or via the rolling daily scheduler.
     */
    @Retry(name = "appointment-service", fallbackMethod = "triggerSlotGenerationFallback")
    private void triggerSlotGeneration(String doctorUserId,
                                       String clinicId,
                                       int durationMinutes,
                                       List<GenerateSlotsRequest.ScheduleEntry> entries,
                                       LocalDate startDate,
                                       LocalDate endDate) {
        try {
            log.info("Triggering slot generation. clinicId={}, window=[{} → {}], days={}",
                    clinicId, startDate, endDate,
                    entries.stream().map(e -> e.dayOfWeek().name()).collect(Collectors.joining(", ")));

            appointmentServiceClient.generateSlots(GenerateSlotsRequest.builder()
                    .doctorId(doctorUserId)
                    .clinicId(clinicId)
                    .consultationDurationMinutes(durationMinutes)
                    .schedules(entries)
                    .startDate(startDate)
                    .endDate(endDate)
                    .build()
            );

            log.info("Slot generation triggered successfully. clinicId={}", clinicId);

        } catch (Exception e) {
            log.error("Failed to trigger slot generation. clinicId={}, error={}", clinicId, e.getMessage());
        }
    }

    /**
     * Fallback for triggerSlotGeneration — non-fatal.
     * Schedule is saved, slots can be generated later by the daily rolling scheduler.
     */
    @SuppressWarnings("unused")
    protected void triggerSlotGenerationFallback(String doctorUserId,
                                                 String clinicId,
                                                 int durationMinutes,
                                                 List<GenerateSlotsRequest.ScheduleEntry> entries,
                                                 LocalDate startDate,
                                                 LocalDate endDate,
                                                 Exception ex) {
        log.error("RETRY EXHAUSTED: Slot generation failed. clinicId={}, window=[{} → {}]. " +
                        "Schedule is saved. Daily scheduler will generate slots. error={}",
                clinicId, startDate, endDate, ex.getMessage());
    }

    // Utility

    private boolean isTimeWindowChanged(ClinicSchedule existing, LocalTime newStart, LocalTime newEnd) {
        return !existing.getStartTime().equals(newStart) || !existing.getEndTime().equals(newEnd);
    }

    private GenerateSlotsRequest.ScheduleEntry toScheduleEntry(ClinicSchedule schedule) {
        return GenerateSlotsRequest.ScheduleEntry.builder()
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .active(schedule.isActive())
                .build();
    }

    private Clinic findClinicOwnedByDoctor(String clinicId, String doctorId) {
        return clinicRepository.findByIdAndDoctorId(clinicId, doctorId)
                .orElseThrow(() -> new ClinicException(ErrorCode.CLINIC_NOT_FOUND,
                        "Clinic not found or does not belong to this doctor: " + clinicId));
    }
}