package com.healthcare.payment.payload.dto.appointment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;

import java.math.BigDecimal;

/**
 * Projection of an appointment returned by appointment-service's internal endpoint.
 * <p>{@code @JsonIgnoreProperties(ignoreUnknown = true)} ensures future fields added to
 * appointment-service's response do not break deserialization here.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record AppointmentDetails(
        String id,
        String patientId,
        String doctorId,
        String clinicId,
        String status,
        BigDecimal consultationFees
) {
}