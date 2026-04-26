// event/AppointmentCancelledEvent.java
package com.healthcare.payment.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

// @JsonIgnoreProperties — if appointment-service adds new fields,
// deserialization will not break on payment-service side
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
    private String cancellationReason;
    private String cancelledBy;
    private boolean refundRequired;
    private Instant occurredAt;
}