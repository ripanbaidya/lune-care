package com.healthcare.payment.consumer;

import com.healthcare.payment.event.AppointmentCancelledEvent;
import com.healthcare.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentEventConsumer {

    private final PaymentService paymentService;

    // Listens to payment-service's own canceled queue
    // Triggered whenever appointment-service publishes appointment.cancelled event
    @RabbitListener(queues = "${rabbitmq.queues.appointment-cancelled}")
    public void handleAppointmentCancelled(AppointmentCancelledEvent event) {
        log.info("Received AppointmentCancelledEvent — appointmentId: {}, refundRequired: {}",
                event.getAppointmentId(), event.isRefundRequired());
        try {
            paymentService.processRefund(event);
        } catch (Exception e) {
            // Log and do not rethrow — rethrowing would cause RabbitMQ to
            // requeue the message and retry infinitely
            log.error("Failed to process refund for appointmentId: {}. Error: {}",
                    event.getAppointmentId(), e.getMessage());
        }
    }
}