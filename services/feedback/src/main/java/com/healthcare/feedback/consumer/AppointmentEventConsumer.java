package com.healthcare.feedback.consumer;

import com.healthcare.feedback.entity.FeedbackEligibility;
import com.healthcare.feedback.event.AppointmentCompletedEvent;
import com.healthcare.feedback.repository.FeedbackEligibilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code appointment.completed} events and creates a
 * {@link FeedbackEligibility} record so patients can submit feedback without
 * {@code feedback-service} calling {@code appointment-service} at runtime.
 * <p><b>Idempotency:</b> If the event is delivered twice (RabbitMQ at-least-once guarantee),
 * the second insert will fail silently on the unique index for {@code appointmentId}
 * — the catch block logs and swallows the error, which is the correct behavior.
 * <p><b>Error handling:</b> Exceptions are never re-thrown — doing so would cause RabbitMQ
 * to requeue infinitely for a poison message.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentEventConsumer {

    private final FeedbackEligibilityRepository eligibilityRepository;

    @RabbitListener(queues = "${rabbitmq.queues.appointment-completed}")
    public void handleAppointmentCompleted(AppointmentCompletedEvent event) {
        log.debug("Processing AppointmentCompletedEvent. eventId={}, appointmentId={}, patientId={}",
                event.getEventId(), event.getAppointmentId(), event.getPatientId());

        try {
            // Idempotency Check - Crucial for RabbitMQ's at-least-once delivery
            if (eligibilityRepository.existsByAppointmentId(event.getAppointmentId())) {
                log.warn("Duplicate event detected. Eligibility already exists for appointmentId={}. Skipping.",
                        event.getAppointmentId());
                return;
            }

            FeedbackEligibility eligibility = FeedbackEligibility.builder()
                    .appointmentId(event.getAppointmentId())
                    .patientId(event.getPatientId())
                    .doctorId(event.getDoctorId())
                    .build();

            eligibilityRepository.save(eligibility);

            log.info("Feedback eligibility successfully initialized. appointmentId={}, patientId={}, doctorId={}",
                    event.getAppointmentId(), event.getPatientId(), event.getDoctorId());

        } catch (DataIntegrityViolationException e) {
            /*
             * Unique Constraint Race Condition: In a high-concurrency environment,
             * existsByAppointmentId might return 'false' for two threads simultaneously,
             * but the DB unique index will catch the second one.
             */
            log.warn("Race condition: Duplicate eligibility record attempted via DB constraint. appointmentId={}",
                    event.getAppointmentId());
        } catch (Exception e) {
            // Poison Message Prevention
            log.error("CRITICAL: Unexpected failure consuming AppointmentCompletedEvent. " +
                            "event_skipped=true, appointmentId={}, error={}",
                    event.getAppointmentId(), e.getMessage(), e);

            // Note: We swallow the exception to prevent RabbitMQ from re-queuing a "poison" message.
            // In a more advanced setup, you would send this to a Dead Letter Exchange (DLX).
        }
    }
}