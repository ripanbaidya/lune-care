package com.healthcare.appointment.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Internal request payload for confirming payment against an appointment — called by payment-service")
public record ConfirmPaymentRequest(

        @Schema(description = "ID of the appointment to confirm payment for")
        @NotNull(message = "Appointment ID is required")
        String appointmentId,

        @Schema(description = "Payment ID issued by the payment gateway after successful payment")
        @NotBlank(message = "Payment ID is required")
        String paymentId
) {
}