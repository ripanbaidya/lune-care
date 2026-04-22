package com.healthcare.auth.payload.request;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(

        @NotBlank(message = "Refresh token must not be blank")
        String refreshToken
) {
}