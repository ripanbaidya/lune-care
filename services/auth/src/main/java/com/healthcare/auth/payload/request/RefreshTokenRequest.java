package com.healthcare.auth.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for refreshing access token")
public record RefreshTokenRequest(

        @Schema(description = "Valid refresh token issued at login or previous refresh")
        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {
}