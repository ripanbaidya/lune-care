package com.healthcare.notification.consumer;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.event.AppointmentEvent;
import com.healthcare.notification.factory.NotificationFactory;
import com.healthcare.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Consumes all appointment domain events from {@code lune.care.exchange}.
 * <p>A single queue bound with routing key {@code appointment.#} receives every
 * appointment event. The consumer switches on the RabbitMQ {@code receivedRoutingKey}
 * message property to decide which notifications to generate — no class hierarchy
 * needed in this service.
 * <h3>Error handling</h3>
 * Exceptions are caught and logged rather than re-thrown. Re throwing would
 * cause RabbitMQ to requeue the message and retry infinitely for a bad message.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentEventConsumer {

    private final NotificationFactory notificationFactory;
    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = "${rabbitmq.queues.appointment-events}")
    public void handleAppointmentEvent(AppointmentEvent event, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();

        log.debug("Received appointment event — routingKey: {}, appointmentId: {}, eventId: {}",
                routingKey, event.getAppointmentId(), event.getEventId());

        try {
            List<Notification> notifications = buildNotifications(routingKey, event);

            if (notifications.isEmpty()) {
                log.debug("No notifications to create for routingKey: {}", routingKey);
                return;
            }

            notificationRepository.saveAll(notifications);

            log.debug("Notifications saved — routingKey: {}, appointmentId: {}, count: {}",
                    routingKey, event.getAppointmentId(), notifications.size());

        } catch (Exception e) {
            // TODO: Route to DLQ when Dead Letter Queue is configured.
            log.error("Failed to process appointment event — routingKey: {}, appointmentId: {}, error: {}",
                    routingKey, event.getAppointmentId(), e.getMessage(), e);
        }
    }

    /**
     * Delegates to {@link NotificationFactory} based on the routing key.
     * Adding a new event type: add a case here + a method in NotificationFactory.
     */
    private List<Notification> buildNotifications(String routingKey, AppointmentEvent event) {
        return switch (routingKey) {
            case "appointment.confirmed" -> notificationFactory.fromConfirmed(event);
            case "appointment.cancelled" -> notificationFactory.fromCancelled(event);
            case "appointment.completed" -> notificationFactory.fromCompleted(event);
            case "appointment.no_show" -> notificationFactory.fromNoShow(event);
            case "appointment.payment_failed" -> notificationFactory.fromPaymentFailed(event);
            default -> {
                log.warn("Unknown appointment routing key — ignoring: {}", routingKey);
                yield Collections.emptyList();
            }
        };
    }
}