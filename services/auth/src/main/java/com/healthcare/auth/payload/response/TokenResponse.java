package com.healthcare.auth.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "JWT token pair issued after authentication")
public record TokenResponse(

        @Schema(description = "Short-lived JWT access token")
        String accessToken,

        @Schema(description = "Long-lived refresh token for obtaining new access tokens")
        String refreshToken,

        @Schema(description = "Token type prefix", example = "Bearer ")
        String tokenType,

        @Schema(description = "Access token validity in milliseconds", example = "900000")
        Long expiresInMillis
) {
    public static TokenResponse of(String accessToken, String refreshToken, Long expiresInMillis) {
        return new TokenResponse(accessToken, refreshToken, "Bearer ", expiresInMillis);
    }
}