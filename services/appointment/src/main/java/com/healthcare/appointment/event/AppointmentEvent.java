package com.healthcare.appointment.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Base event — all appointment events share this structure.
 */
@Getter
@Setter
@NoArgsConstructor
public abstract class AppointmentEvent implements Serializable {

    // unique per event for idempotency
    private String eventId;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String clinicId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private Instant occurredAt;
}