package com.healthcare.notification.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Base event published by appointment-service on the {@code lune.care.exchange}.
 * <p>{@code @JsonIgnoreProperties(ignoreUnknown = true)} ensures future fields
 * added to appointment-service events do not break deserialization here.
 * <p>All appointment events share this common structure. The consumer uses
 * the RabbitMQ message header {@code __TypeId__} (set automatically by
 * {@link org.springframework.amqp.support.converter.Jackson2JsonMessageConverter})
 * to determine the concrete subtype. However, since notification-service only
 * needs common fields + the routing key to decide what to do, we use a single
 * flat DTO and read the routing key from the message properties.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentEvent {

    private String eventId;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String clinicId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private Instant occurredAt;

    /*
     * ------ Note ------
     * Fields below are present only on specific subtypes.
     * We declare them here (all optional / nullable) so a single DTO can handle
     * all five event variants without a class hierarchy in this service.
     */

    /**
     * Present on appointment.cancelled
     */
    private String cancellationReason;

    /**
     * Present on appointment.cancelled
     */
    private String cancelledBy;

    /**
     * Present on appointment.cancelled — true if refund must be issued
     */
    private boolean refundRequired;

    /**
     * Present on appointment.payment_failed
     */
    private String failureReason;

    /**
     * Present on appointment.confirmed
     */
    private String paymentId;
}