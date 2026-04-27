package com.healthcare.feedback.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Event published by appointment-service when an appointment is marked COMPLETED.
 * Consumed by feedback-service to create a {@code FeedbackEligibility} record.
 * <p>{@code @JsonIgnoreProperties(ignoreUnknown = true)} ensures future fields
 * added to the event do not break deserialization here.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentCompletedEvent {

    private String eventId;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String clinicId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private Instant occurredAt;
}