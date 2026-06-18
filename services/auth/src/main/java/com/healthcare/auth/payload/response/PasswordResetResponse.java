package com.healthcare.auth.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Response returned after requesting a password reset")
public record PasswordResetResponse(

        @Schema(description = "Human-readable message")
        String message,

        @Schema(description = "One-time reset token to be used on the reset screen")
        String resetToken,

        @Schema(description = "Token expiration timestamp")
        Instant expiresAt
) {
}
