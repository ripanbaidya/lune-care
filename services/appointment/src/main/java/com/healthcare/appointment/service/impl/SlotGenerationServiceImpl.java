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

    @Override
    @Transactional
    public int generateSlots(GenerateSlotsRequest request) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(request.daysAhead());
        String doctorId = request.doctorId();
        String clinicId = request.clinicId();

        log.info("Starting slot generation. doctorId={}, clinicId={}, daysAhead={}, range=[{} to {}]",
                doctorId, clinicId, request.daysAhead(), today, endDate);

        long startTime = System.currentTimeMillis();

        try {
            log.debug("Loading existing slot keys to prevent duplicates. doctorId={}", doctorId);
            Set<String> existingKeys = loadExistingSlotKeys(doctorId, clinicId, today, endDate);
            log.debug("Found {} existing slots in range. doctorId={}", existingKeys.size(), doctorId);

            List<Slot> slotsToSave = new ArrayList<>();

            for (LocalDate date = today; !date.isAfter(endDate); date = date.plusDays(1)) {
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
                                        existingKeys, slotsToSave
                                )
                        );
            }

            // Performance Warning for Large Batches
            if (slotsToSave.isEmpty()) {
                log.info("No new slots to generate for the given schedule. doctorId={}", doctorId);
                return 0;
            }

            log.debug("Saving batch of {} slots. doctorId={}", slotsToSave.size(), doctorId);
            slotRepository.saveAll(slotsToSave);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Slot generation successful. doctorId={}, slotsCreated={}, duration={}ms",
                    doctorId, slotsToSave.size(), duration);

            return slotsToSave.size();

        } catch (Exception e) {
            log.error("Slot generation failed. doctorId={}, clinicId={}, daysAhead={}, error={}",
                    doctorId, clinicId, request.daysAhead(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void generateSlotsForDate(GenerateSlotsRequest request, LocalDate date) {
        String doctorId = request.doctorId();
        String clinicId = request.clinicId();

        log.debug("Processing daily slot generation. doctorId={}, clinicId={}, date={}", doctorId, clinicId, date);

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
                                    existingKeys, slotsToSave
                            )
                    );

            if (slotsToSave.isEmpty()) {
                log.info("No new slots generated for date. doctorId={}, date={}, reason=ALREADY_EXISTS_OR_NO_SCHEDULE",
                        doctorId, date);
                return;
            }

            slotRepository.saveAll(slotsToSave);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Daily slots generated. doctorId={}, date={}, count={}, duration={}ms",
                    doctorId, date, slotsToSave.size(), duration);

        } catch (Exception e) {
            log.error("Failed daily slot generation. doctorId={}, date={}, error={}",
                    doctorId, date, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Cancel all AVAILABLE slots for a given clinic and day of the week.
     * <b>Called when:</b> The doctor explicitly deletes a Schedule day and
     * A schedule day's time window changes (old slots canceled, new ones generated)
     * <p><b>Note:</b>{@code LOCKED} and {@code BOOKED} slots are not affected.</p>
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

        log.info("Cancelled {} AVAILABLE slots — clinicId: {}, dayOfWeek: {}, preserving LOCKED and BOOKED",
                cancelled, clinicId, dayOfWeek);

        return cancelled;
    }

    // Private helpers

    /**
     * Loads all existing slot keys for a date range into a Set for in-memory dedup.
     * One DB query upfront — avoids per-slot queries inside the loop.
     */
    private Set<String> loadExistingSlotKeys(String doctorId, String clinicId,
                                             LocalDate from, LocalDate to) {
        long start = System.currentTimeMillis();

        Set<String> keys = slotRepository
                .findByDoctorIdAndClinicIdAndSlotDateBetween(doctorId, clinicId, from, to)
                .stream()
                .map(slot -> buildSlotKey(slot.getClinicId(),
                        slot.getSlotDate(), slot.getStartTime()))
                .collect(Collectors.toSet());

        log.debug("Pre-loaded existing slot keys. doctorId={}, count={}, duration={}ms",
                doctorId, keys.size(), (System.currentTimeMillis() - start));

        return keys;
    }

    /**
     * Builds slot objects for a single day and adds them to the accumulator list.
     * Uses the in-memory existingKeys set — no DB queries inside the loop.
     * Also adds newly created keys to existingKeys immediately to prevent duplicates within
     * the same generation run.
     */
    private void collectSlots(String doctorId, String clinicId, LocalDate date,
                              LocalTime startTime, LocalTime endTime,
                              int durationMinutes,
                              Set<String> existingKeys,
                              List<Slot> accumulator) {

        LocalTime current = startTime;
        int initialCount = accumulator.size();
        int skippedCount = 0;

        while (!current.plusMinutes(durationMinutes).isAfter(endTime)) {
            LocalTime slotEnd = current.plusMinutes(durationMinutes);
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
                existingKeys.add(key);
            } else {
                skippedCount++;
            }

            current = slotEnd;
        }

        if (skippedCount > 0) {
            log.debug("Slot generation deduplication summary. date={}, created={}, skipped={}",
                    date, (accumulator.size() - initialCount), skippedCount);
        }
    }

    private String buildSlotKey(String clinicId, LocalDate date, LocalTime startTime) {
        return clinicId + "|" + date + "|" + startTime;
    }
}