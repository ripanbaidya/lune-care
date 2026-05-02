package com.healthcare.auth.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for user login")
public record LoginRequest(

        @Schema(description = "Registered 10-digit mobile number", example = "9876543210")
        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        @Schema(description = "Account password", example = "secret123")
        @NotBlank(message = "Password is required")
        String password
) {
}