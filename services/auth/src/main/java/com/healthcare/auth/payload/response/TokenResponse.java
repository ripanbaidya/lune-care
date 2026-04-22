package com.healthcare.auth.payload.response;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresInMillis
) {
    public static TokenResponse of(String accessToken, String refreshToken, Long expiresInMillis) {
        return new TokenResponse(accessToken, refreshToken, "Bearer ", expiresInMillis);
    }
}