package com.healthcare.appointment.schedular;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

/**
 * Scheduler that cancels appointments stuck in {@code PENDING_PAYMENT} beyond the
 * 15-minute payment window (SAGA compensation — Step 2b).
 * <p><b>Design notes:</b>
 * <ul>
 *   <li>Runs every 5 minutes via {@code fixedDelay} (not {@code fixedRate}) so
 *       later runs wait for the previous one to finish — avoids overlap.</li>
 *   <li>Each appointment is canceled in its own transaction (delegated to
 *       {@link AppointmentService#cancelDueToTimeout}). A failure on one appointment
 *       does not affect others in the same batch.</li>
 *   <li><b>Clustered environments:</b> If multiple appointment-service instances run
 *       simultaneously, two instances may both pick up the same timed-out appointment.
 *       The second call is safe because {@code cancelDueToTimeout} checks
 *       {@code status == PENDING_PAYMENT} before acting — if the first instance already
 *       canceled it, the second instance skips it. For production clusters, add a
 *       distributed lock (e.g. ShedLock) around this scheduler to avoid redundant
 *       DB queries across instances.</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentTimeoutScheduler {

    @Value("${app.appointment.payment-timeout-minutes}")
    private int paymentTimeoutMinutes;

    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;

    /**
     * Finds and cancels all timed-out {@code PENDING_PAYMENT} appointments.
     * <p>Uses {@code fixedDelay} so runs are sequential — the next run starts
     * 5 minutes after the previous one completes, regardless of how long it took.
     */
    @Scheduled(fixedDelay = 300_000) // 5 minutes
    public void cancelTimedOutAppointments() {
        Instant cutoff = LocalDateTime.now()
                .minusMinutes(paymentTimeoutMinutes)
                .atZone(ZoneId.systemDefault())
                .toInstant();

        List<Appointment> timedOut = appointmentRepository.findTimedOutPendingAppointments(cutoff);

        if (timedOut.isEmpty()) {
            log.debug("Timeout scheduler — no timed-out appointments found");
            return;
        }

        log.info("Timeout scheduler — found {} appointment(s) to cancel (cutoff: {})",
                timedOut.size(), cutoff);

        int cancelled = 0;
        int failed = 0;

        for (Appointment appointment : timedOut) {
            String appointmentId = appointment.getId();
            try {
                appointmentService.cancelDueToTimeout(appointmentId);
                cancelled++;
            } catch (Exception e) {
                log.error("Timeout scheduler — failed to cancel appointmentId: {}, error: {}",
                        appointmentId, e.getMessage());
                failed++;
            }
        }

        log.info("Timeout scheduler complete — cancelled: {}, failed: {}", cancelled, failed);
    }
}