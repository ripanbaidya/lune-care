package com.healthcare.appointment.schedular;

import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentTimeoutScheduler {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;

    // SAGA compensation — runs every 5 minutes.
    // Finds PENDING_PAYMENT appointments older than 15 minutes and cancels them.
    // This is the automatic rollback mechanism when payment never arrives.
    @Scheduled(fixedDelay = 300_000) // every 5 minutes
    public void cancelTimedOutAppointments() {
        Instant cutoff = LocalDateTime.now()
                .minusMinutes(15)
                .atZone(ZoneId.systemDefault())
                .toInstant();

        var timedOut = appointmentRepository.findTimedOutPendingAppointments(cutoff);

        if (timedOut.isEmpty()) return;

        log.info("Timeout scheduler: found {} appointments to cancel", timedOut.size());

        timedOut.forEach(appointment -> {
            try {
                appointmentService.cancelDueToTimeout(appointment.getId());
            } catch (Exception e) {
                log.error("Failed to cancel timed-out appointment: {}, error: {}",
                        appointment.getId(), e.getMessage());
            }
        });
    }
}