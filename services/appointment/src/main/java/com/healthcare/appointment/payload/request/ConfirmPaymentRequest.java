package com.healthcare.appointment.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConfirmPaymentRequest(

        @NotNull(message = "Appointment ID is required")
        String appointmentId,

        @NotBlank(message = "Payment ID is required")
        String paymentId

) {
}