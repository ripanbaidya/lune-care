package com.healthcare.auth.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for completing a password reset")
public record ResetPasswordRequest(

        @Schema(description = "One-time password reset token", example = "rpt_4f7d2c...")
        @NotBlank(message = "Reset token is required")
        String resetToken,

        @Schema(description = "New account password", example = "newStrongPassword123")
        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String newPassword
) {
}
