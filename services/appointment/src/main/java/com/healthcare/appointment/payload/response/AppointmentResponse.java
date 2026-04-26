package com.healthcare.appointment.payload.response;

import com.healthcare.appointment.enums.AppointmentStatus;
import com.healthcare.appointment.enums.CancelledBy;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Builder
public record AppointmentResponse(

        String id,
        String patientId,
        String doctorId,
        String clinicId,
        String slotId,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,
        AppointmentStatus status,
        BigDecimal consultationFees,
        String paymentId,
        String cancellationReason,
        CancelledBy cancelledBy

) {
}