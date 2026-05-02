package com.healthcare.patient.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Internal request payload for creating a patient profile — called by auth-service after registration")
public record CreateProfileRequest(

        @Schema(description = "Auth-service user ID to link the profile to")
        @NotNull
        String userId,

        @Schema(description = "Patient's first name", example = "Rahul")
        @NotBlank
        String firstName,

        @Schema(description = "Patient's last name", example = "Sharma")
        @NotBlank
        String lastName,

        @Schema(description = "Registered phone number", example = "9876543210")
        @NotBlank
        String phoneNumber
) {
}