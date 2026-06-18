package com.healthcare.payment.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for simulating a demo payment failure")
public record DemoPaymentFailureRequest(

        @Schema(
                description = "ID of the appointment for which demo payment failed",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        @Schema(
                description = "Optional failure reason shown in demo mode",
                example = "Card declined in demo mode"
        )
        String reason
) {
}
