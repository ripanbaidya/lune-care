package com.healthcare.auth.payload.response;

import com.healthcare.auth.entity.User;

public record AuthResponse(
        UserResponse user,
        TokenResponse token
) {

    public static AuthResponse of(User user, TokenResponse token) {
        return new AuthResponse(UserResponse.from(user), token);
    }
}