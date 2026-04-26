package com.healthcare.appointment.schedular;

import com.healthcare.appointment.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlotGenerationScheduler {

    private final SlotRepository slotRepository;

    // Runs at midnight every day.
    // Keeps the 30-day slot window rolling — new day is always pre-generated.
    // The actual generation is done by SlotGenerationService per clinic.
    // For now this is a placeholder — full implementation depends on fetching
    // all active clinic schedules, which requires a doctor-service call.
    // TODO: implement when doctor-service exposes /internal/doctor/all-active-schedules
    @Scheduled(cron = "0 0 0 * * *")
    public void generateSlotsForTomorrow() {
        log.info("Daily slot generation schedular triggered");

        // Implementation: fetch all active clinic schedules from doctor-service
        // and call SlotGenerationService.generateSlotsForDate() for each
    }
}
