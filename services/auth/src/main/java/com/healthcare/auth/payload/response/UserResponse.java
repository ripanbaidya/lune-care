package com.healthcare.auth.payload.response;

import com.healthcare.auth.entity.User;

public record UserResponse(
        String id,
        String role,
        String status
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getRole().name(),
                user.getAccountStatus().name()
        );
    }
}