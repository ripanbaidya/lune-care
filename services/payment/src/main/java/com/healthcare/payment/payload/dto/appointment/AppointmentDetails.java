package com.healthcare.payment.payload.dto.appointment;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record AppointmentDetails(
        String id,
        String patientId,
        String doctorId,
        String status,
        BigDecimal consultationFees
) {
}