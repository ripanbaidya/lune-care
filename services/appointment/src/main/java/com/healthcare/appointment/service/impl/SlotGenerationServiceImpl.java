package com.healthcare.appointment.service.impl;

import com.healthcare.appointment.entity.Slot;
import com.healthcare.appointment.enums.SlotStatus;
import com.healthcare.appointment.payload.request.GenerateSlotsRequest;
import com.healthcare.appointment.repository.SlotRepository;
import com.healthcare.appointment.service.SlotGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlotGenerationServiceImpl implements SlotGenerationService {

    private final SlotRepository slotRepository;

    /*
     * Generates slots for the date range [startDate, endDate] defined in the request.
     * Guards:
     * startDate is clamped today in the request compact constructor — no past-date generation.
     * For today specifically, slots whose start time has already passed are skipped.
     * Duplicate slots are filtered via an in-memory key set loaded once upfront.
     */
    @Override
    @Transactional
    public int generateSlots(GenerateSlotsRequest request) {
        LocalDate startDate = request.startDate();
        LocalDate endDate = request.endDate();
        String doctorId = request.doctorId();
        String clinicId = request.clinicId();

        log.info("Starting slot generation. doctorId={}, clinicId={}, range=[{} → {}]",
                doctorId, clinicId, startDate, endDate);

        long startTime = System.currentTimeMillis();

        try {
            Set<String> existingKeys = loadExistingSlotKeys(doctorId, clinicId, startDate, endDate);
            log.debug("Pre-loaded {} existing slot keys. doctorId={}", existingKeys.size(), doctorId);

            List<Slot> slotsToSave = new ArrayList<>();

            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                final LocalDate currentDate = date;

                request.schedules().stream()
                        .filter(s -> s.active() && s.dayOfWeek() == currentDate.getDayOfWeek())
                        .findFirst()
                        .ifPresent(schedule ->
                                collectSlots(
                                        doctorId,
                                        clinicId,
                                        currentDate,
                                        schedule.startTime(),
                                        schedule.endTime(),
                                        request.consultationDurationMinutes(),
                                        existingKeys,
                                        slotsToSave
                                )
                        );
            }

            if (slotsToSave.isEmpty()) {
                log.info("No new slots to generate for the given schedule. doctorId={}", doctorId);
                return 0;
            }

            slotRepository.saveAll(slotsToSave);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Slot generation complete. doctorId={}, slotsCreated={}, duration={}ms",
                    doctorId, slotsToSave.size(), duration);

            return slotsToSave.size();

        } catch (Exception e) {
            log.error("Slot generation failed. doctorId={}, clinicId={}, range=[{} → {}], error={}",
                    doctorId, clinicId, startDate, endDate, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Generates slots for a single specific date.
     * Used by the daily scheduler to extend the rolling window by one day.
     * The past-time guard still applies if the date happens to be today.
     */
    @Override
    @Transactional
    public void generateSlotsForDate(GenerateSlotsRequest request, LocalDate date) {
        String doctorId = request.doctorId();
        String clinicId = request.clinicId();

        // Never generate for a past date
        if (date.isBefore(LocalDate.now())) {
            log.warn("generateSlotsForDate called with past date — skipping. doctorId={}, date={}", doctorId, date);
            return;
        }

        log.debug("Daily slot generation for single date. doctorId={}, clinicId={}, date={}", doctorId, clinicId, date);

        long startTime = System.currentTimeMillis();

        try {
            Set<String> existingKeys = loadExistingSlotKeys(doctorId, clinicId, date, date);
            List<Slot> slotsToSave = new ArrayList<>();

            request.schedules().stream()
                    .filter(s -> s.active() && s.dayOfWeek() == date.getDayOfWeek())
                    .findFirst()
                    .ifPresent(schedule ->
                            collectSlots(
                                    doctorId,
                                    clinicId,
                                    date,
                                    schedule.startTime(),
                                    schedule.endTime(),
                                    request.consultationDurationMinutes(),
                                    existingKeys,
                                    slotsToSave
                            )
                    );

            if (slotsToSave.isEmpty()) {
                log.info("No new slots generated. doctorId={}, date={}", doctorId, date);
                return;
            }

            slotRepository.saveAll(slotsToSave);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Daily slots generated. doctorId={}, date={}, count={}, duration={}ms",
                    doctorId, date, slotsToSave.size(), duration);

        } catch (Exception e) {
            log.error("Daily slot generation failed. doctorId={}, date={}, error={}",
                    doctorId, date, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Cancels all AVAILABLE slots for a clinic on a given day of the week, from today onwards.
     * LOCKED and BOOKED slots are intentionally preserved.
     */
    @Override
    @Transactional
    public int cancelAvailableSlotsForDay(String clinicId, DayOfWeek dayOfWeek) {
        int isoDow = dayOfWeek.getValue();

        int cancelled = slotRepository.cancelAvailableSlotsForClinicAndDay(
                clinicId,
                LocalDate.now(),
                isoDow
        );

        log.info("Cancelled {} AVAILABLE slots — clinicId={}, dayOfWeek={}", cancelled, clinicId, dayOfWeek);
        return cancelled;
    }

    // Private helpers

    /**
     * Loads all existing slot composite keys for the date range into a Set for O(1) dedup.
     * One DB query upfront avoids N per-slot existence checks inside the loop.
     */
    private Set<String> loadExistingSlotKeys(String doctorId, String clinicId,
                                             LocalDate from, LocalDate to) {
        long start = System.currentTimeMillis();

        Set<String> keys = slotRepository
                .findByDoctorIdAndClinicIdAndSlotDateBetween(doctorId, clinicId, from, to)
                .stream()
                .map(slot -> buildSlotKey(slot.getClinicId(), slot.getSlotDate(), slot.getStartTime()))
                .collect(Collectors.toSet());

        log.debug("Loaded existing slot keys. doctorId={}, count={}, duration={}ms",
                doctorId, keys.size(), (System.currentTimeMillis() - start));

        return keys;
    }

    /**
     * Builds slot objects for a single day and appends them to the accumulator.
     * <p><b>Past-time guard:</b> When {@code date} is today, any slot whose start time
     * is at or before the current time is skipped. This prevents creating slots for
     * appointments that can no longer be booked.
     * <p>New keys are added to {@code existingKeys} immediately so a second schedule entry
     * for the same day (rare but possible) cannot produce duplicates within the same run.
     */
    private void collectSlots(String doctorId, String clinicId, LocalDate date,
                              LocalTime startTime, LocalTime endTime,
                              int durationMinutes,
                              Set<String> existingKeys,
                              List<Slot> accumulator) {

        boolean isToday = date.isEqual(LocalDate.now());
        LocalTime now = LocalTime.now();

        LocalTime current = startTime;
        int initialCount = accumulator.size();
        int skipped = 0;
        int pastSkipped = 0;

        while (true) {
            LocalTime slotEnd = current.plusMinutes(durationMinutes);

            // Stop if the slot end would exceed the window end time
            if (slotEnd.isAfter(endTime)) {
                break;
            }

            // --- Past-time guard ---
            // For today: skip slots that start at or before the current wall-clock time.
            // A slot starting "now" is also skipped because the patient has no time to book it.
            if (isToday && !current.isAfter(now)) {
                pastSkipped++;
                current = slotEnd;
                continue;
            }

            String key = buildSlotKey(clinicId, date, current);

            if (!existingKeys.contains(key)) {
                Slot slot = new Slot();
                slot.setDoctorId(doctorId);
                slot.setClinicId(clinicId);
                slot.setSlotDate(date);
                slot.setStartTime(current);
                slot.setEndTime(slotEnd);
                slot.setStatus(SlotStatus.AVAILABLE);

                accumulator.add(slot);
                existingKeys.add(key); // prevent intra-run duplicates
            } else {
                skipped++;
            }

            current = slotEnd;
        }

        int created = accumulator.size() - initialCount;

        if (pastSkipped > 0) {
            log.debug("Skipped {} past-time slot(s) for today. date={}", pastSkipped, date);
        }
        if (skipped > 0) {
            log.debug("Dedup skipped {} existing slot(s). date={}", skipped, date);
        }
        log.debug("collectSlots summary. date={}, created={}, dedupSkipped={}, pastSkipped={}",
                date, created, skipped, pastSkipped);
    }

    private String buildSlotKey(String clinicId, LocalDate date, LocalTime startTime) {
        return clinicId + "|" + date + "|" + startTime;
    }
}