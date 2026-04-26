package com.healthcare.payment.payload.request;

import jakarta.validation.constraints.NotBlank;

public record InitiatePaymentRequest(

        @NotBlank(message = "Appointment ID is required")
        String appointmentId
) {
}