package com.healthcare.admin.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(
        name = "DoctorSummaryResponse",
        description = "Summary details of a doctor used in admin listing views"
)
public record DoctorSummaryResponse(

        @Schema(description = "Unique identifier of the doctor", example = "doc-7890")
        String id,

        @Schema(description = "Associated user ID of the doctor", example = "user-12345")
        String userId,

        @Schema(description = "Doctor's first name", example = "Anjali")
        String firstName,

        @Schema(description = "Doctor's last name", example = "Mehta")
        String lastName,

        @Schema(description = "Contact phone number", example = "+919876543210")
        String phoneNumber,

        @Schema(description = "Medical specialization", example = "Cardiology")
        String specialization,

        @Schema(description = "Highest qualification", example = "MBBS, MD")
        String qualification,

        @Schema(description = "Timestamp when the doctor profile was created")
        Instant createdAt

) {
}