package com.healthcare.auth.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for user logout")
public record LogoutRequest(

        @Schema(description = "Refresh token to be revoked on logout")
        @NotBlank(message = "Refresh token must not be blank")
        String refreshToken
) {
}