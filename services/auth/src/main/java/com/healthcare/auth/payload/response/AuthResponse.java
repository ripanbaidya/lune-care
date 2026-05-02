package com.healthcare.auth.payload.response;

import com.healthcare.auth.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response returned on successful register or login")
public record AuthResponse(

        @Schema(description = "Basic user identity details")
        UserResponse user,

        @Schema(description = "Issued access and refresh tokens")
        TokenResponse token
) {
    public static AuthResponse of(User user, TokenResponse token) {
        return new AuthResponse(UserResponse.from(user), token);
    }
}