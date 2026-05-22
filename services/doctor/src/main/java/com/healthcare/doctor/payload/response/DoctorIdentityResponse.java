package com.healthcare.doctor.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "Minimal doctor identity payload for internal service-to-service usage")
@Builder
public record DoctorIdentityResponse(
        @Schema(description = "Linked auth-service user ID")
        String userId,

        @Schema(description = "First name")
        String firstName,

        @Schema(description = "Last name")
        String lastName,

        @Schema(description = "Computed display name")
        String fullName
) {
}
