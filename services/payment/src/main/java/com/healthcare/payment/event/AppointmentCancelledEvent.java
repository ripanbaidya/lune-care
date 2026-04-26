package com.healthcare.payment.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Event consumed by payment-service when an appointment is cancelled.
 * <p>Published by appointment-service via {@code lune.care.exchange} with
 * routing key {@code appointment.cancelled}.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentCancelledEvent {
    private String eventId;

    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String clinicId;

    private LocalDate appointmentDate;
    private LocalTime startTime;

    /**
     * Who triggered the cancellation: PATIENT | DOCTOR | SYSTEM.
     * Kept as {@code String} intentionally — payment-service logs it but never switches on its value,
     * avoiding cross-service enum coupling.
     */
    private String cancellationReason;
    private String cancelledBy;

    /**
     * {@code true} only when the appointment was CONFIRMED before cancellation,
     * meaning payment was successfully collected and must be refunded.
     */
    private boolean refundRequired;

    private Instant occurredAt;
}