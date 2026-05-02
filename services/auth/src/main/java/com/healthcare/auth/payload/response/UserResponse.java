package com.healthcare.auth.payload.response;

import com.healthcare.auth.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Basic user identity snapshot")
public record UserResponse(

        @Schema(description = "Unique user ID (UUID)", example = "a1b2c3d4-e5f6-...")
        String id,

        @Schema(description = "Assigned role", example = "ROLE_PATIENT")
        String role,

        @Schema(description = "Current account status", example = "ACTIVE")
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