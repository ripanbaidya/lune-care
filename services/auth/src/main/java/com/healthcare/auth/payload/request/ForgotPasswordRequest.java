package com.healthcare.auth.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for initiating a password reset")
public record ForgotPasswordRequest(

        @Schema(description = "Registered phone number", example = "9876543210")
        @NotBlank(message = "Phone number is required")
        String phoneNumber
) {
}
