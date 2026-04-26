package com.healthcare.appointment.publisher;

import com.healthcare.appointment.config.properties.RabbitMQProperties;
import com.healthcare.appointment.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties rabbitMQProperties;

    public void publishConfirmed(AppointmentConfirmedEvent event) {
        publish("appointment.confirmed", event);
    }

    public void publishCancelled(AppointmentCancelledEvent event) {
        publish("appointment.cancelled", event);
    }

    public void publishCompleted(AppointmentCompletedEvent event) {
        publish("appointment.completed", event);
    }

    public void publishNoShow(AppointmentNoShowEvent event) {
        publish("appointment.no_show", event);
    }

    public void publishPaymentFailed(AppointmentPaymentFailedEvent event) {
        publish("appointment.payment_failed", event);
    }

    private void publish(String routingKey, Object event) {
        String exchange = rabbitMQProperties.exchange().name();
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("Event published - exchange: {}, routingKey: {}, event: {}",
                    exchange, routingKey, event.getClass().getSimpleName());
        } catch (Exception e) {
            // Log and continue; a publish failure must not roll back the DB transaction.
            // The event can be retried or replayed later.
            log.error("Failed to publish event — routingKey: {}, error: {}", routingKey,
                    e.getMessage());
        }
    }
}
