package com.healthcare.auth.payload.response;

import com.healthcare.auth.entity.User;

public record UserProfileResponse(
        String id,
        String phoneNumber,
        String role,
        String status
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getAccountStatus().name()
        );
    }
}