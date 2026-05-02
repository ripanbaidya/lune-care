package com.healthcare.auth.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for doctor registration")
public record DoctorRegisterRequest(

        @Schema(description = "Doctor's first name", example = "Anjali")
        @NotBlank(message = "First name is required")
        String firstName,

        @Schema(description = "Doctor's last name", example = "Mehta")
        @NotBlank(message = "Last name is required")
        String lastName,

        @Schema(description = "10-digit mobile number", example = "9876543211")
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
        String phoneNumber,

        @Schema(description = "Password (min 8 characters)", example = "secret123")
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password
) {
}