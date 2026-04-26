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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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

        log.info("Processing schedule update. doctorId: {}, clinicId: {}, incomingDays: {}",
                userId, clinicId, request.schedules().stream()
                        .map(s -> s.dayOfWeek().name())
                        .collect(Collectors.joining(", ")));

        // Load existing schedules as a map keyed by DayOfWeek for O(1) lookup
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
                // Case 1: New day - insert and generate slots
                log.info("New schedule day detected — day: {}, clinicId: {}", day, clinicId);
                ClinicSchedule newSchedule = ClinicSchedule.builder()
                        .clinic(clinic)
                        .dayOfWeek(day)
                        .startTime(newStart)
                        .endTime(newEnd)
                        .build();

                savedSchedules.add(scheduleRepository.save(newSchedule));
                daysToGenerate.add(toScheduleEntry(newSchedule));

            } else if (isTimeWindowChanged(existing, newStart, newEnd)) {
                // Case 2: Day exists but time changed — update + cancel old AVAILABLE
                // slots + regenerate new slots
                log.info("Schedule time changed — day: {}, clinicId: {}, old: {}–{}, new: {}–{}",
                        day, clinicId, existing.getStartTime(), existing.getEndTime(), newStart, newEnd);

                existing.setStartTime(newStart);
                existing.setEndTime(newEnd);
                savedSchedules.add(scheduleRepository.save(existing));

                // Cancel AVAILABLE slots for this specific day before regenerating.
                // LOCKED and BOOKED slots are deliberately preserved.
                cancelAvailableSlotsForDay(clinicId, day);

                daysToGenerate.add(toScheduleEntry(existing));

            } else {
                // Case 3: Day exists, same time window — no action needed
                log.debug("Schedule unchanged for day: {}, clinicId: {} — skipping", day, clinicId);
                savedSchedules.add(existing);
            }
        }

        // Trigger slot generation only for days that actually changed or were added.
        // Sending only the affected days keeps the generation efficient.
        if (!daysToGenerate.isEmpty()) {
            triggerSlotGeneration(doctor.getUserId(), clinicId,
                    clinic.getConsultationDurationMinutes(),
                    daysToGenerate);
        } else {
            log.info("No schedule changes requiring slot generation — clinicId: {}", clinicId);
        }

        log.info("Schedule update complete — clinicId: {}, processedDays: {}", clinicId, savedSchedules.size());

        return savedSchedules.stream()
                .map(ClinicMapper::toScheduleResponse)
                .toList();
    }

    /**
     * Delete a specific day from the schedule.
     */
    @Override
    @Transactional
    public void deleteScheduleDay(String userId, String clinicId, DayOfWeek dayOfWeek) {
        Doctor doctor = doctorService.findByUserId(userId);
        findClinicOwnedByDoctor(clinicId, doctor.getId());

        log.info("Deleting schedule day — doctorId: {}, clinicId: {}, day: {}",
                doctor.getUserId(), clinicId, dayOfWeek);

        ClinicSchedule schedule = scheduleRepository
                .findByClinicIdAndDayOfWeek(clinicId, dayOfWeek)
                .orElseThrow(() -> {
                    log.warn("Schedule day not found — clinicId: {}, day: {}", clinicId, dayOfWeek);
                    return new ClinicException(ErrorCode.CLINIC_SCHEDULE_NOT_FOUND,
                            "No schedule found for " + dayOfWeek + " at this clinic");
                });

        scheduleRepository.delete(schedule);
        log.info("Schedule row deleted — clinicId: {}, day: {}", clinicId, dayOfWeek);

        // Cancel all future AVAILABLE slots for this day.
        // LOCKED and BOOKED slots survive — patients in those states are unaffected.
        cancelAvailableSlotsForDay(clinicId, dayOfWeek);

        log.info("Schedule day removal complete — clinicId: {}, day: {}", clinicId, dayOfWeek);
    }

    /**
     * Get the entire schedule for a clinic.
     *
     * @param userId   the doctor's userId for whom to fetch the schedule
     * @param clinicId the id of the clinic for which to fetch the schedule
     * @return the list of schedule entries for the clinic
     */
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

    /*
     * Helper methods
     */

    /**
     * Check if the time window of an existing schedule has changed.
     *
     * @param existing the existing schedule
     * @param newStart the new start time of the schedule
     * @param newEnd   the new end time of the schedule
     * @return true if the time window has changed, false otherwise
     */
    private boolean isTimeWindowChanged(ClinicSchedule existing, LocalTime newStart, LocalTime newEnd) {
        return !existing.getStartTime().equals(newStart) || !existing.getEndTime().equals(newEnd);
    }

    /**
     * Calls the {@code appointment-service} to cancel all available slots for a specific day.
     *
     * @param clinicId  the id of the clinic for which to cancel available slots
     * @param dayOfWeek the day for which to cancel available slots
     */
    private void cancelAvailableSlotsForDay(String clinicId, DayOfWeek dayOfWeek) {
        try {
            appointmentServiceClient.cancelAvailableSlotsForDay(clinicId, dayOfWeek.name());
            log.info("Available slots cancelled — clinicId: {}, day: {}", clinicId, dayOfWeek);
        } catch (Exception e) {
            // Non-blocking — log and continue. Stale slots will not cause booking issues
            // because slot generation is idempotent and the unique constraint prevents duplicates.
            log.error("Failed to cancel available slots — clinicId: {}, day: {}. Error: {}",
                    clinicId, dayOfWeek, e.getMessage());
        }
    }

    /**
     * Calls the {@code appointment-service} to generate appointment slots for the
     * given schedule entries.
     * Only called for days that were added or had their time window changed.
     *
     * @param doctorUserId    The id of the doctor for whom slots are being generated.
     * @param clinicId        The id of the clinic where the slots will be created.
     * @param durationMinutes The duration of each appointment slot in minutes.
     * @param entries         A list of schedule entries specifying the days of the week and time ranges
     *                        during which slots will be generated.
     */
    private void triggerSlotGeneration(String doctorUserId, String clinicId,
                                       int durationMinutes,
                                       List<GenerateSlotsRequest.ScheduleEntry> entries) {
        try {
            log.info("Triggering slot generation — clinicId: {}, days: {}",
                    clinicId, entries.stream()
                            .map(e -> e.dayOfWeek().name())
                            .collect(Collectors.joining(", ")));

            appointmentServiceClient.generateSlots(GenerateSlotsRequest.builder()
                    .doctorId(doctorUserId)
                    .clinicId(clinicId)
                    .consultationDurationMinutes(durationMinutes)
                    .schedules(entries)
                    .daysAhead(30)
                    .build()
            );

            log.info("Slot generation triggered successfully — clinicId: {}", clinicId);

        } catch (Exception e) {
            log.error("Failed to trigger slot generation — clinicId: {}. Error: {}", clinicId, e.getMessage());
        }
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
