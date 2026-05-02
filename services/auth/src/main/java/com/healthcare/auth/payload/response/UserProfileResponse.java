package com.healthcare.auth.payload.response;

import com.healthcare.auth.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authenticated user's profile details")
public record UserProfileResponse(

        @Schema(description = "Unique user ID (UUID)")
        String id,

        @Schema(description = "Registered phone number", example = "9876543210")
        String phoneNumber,

        @Schema(description = "Assigned role", example = "ROLE_DOCTOR")
        String role,

        @Schema(description = "Current account status", example = "ACTIVE")
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