package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.Specialization;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;

@Schema(description = "Summarized doctor details used in admin verification listings")
@Builder
public record DoctorSummaryResponse(

        @Schema(description = "Doctor's internal profile ID")
        String id,

        @Schema(description = "Linked auth-service user ID")
        String userId,

        @Schema(description = "First name")
        String firstName,

        @Schema(description = "Last name")
        String lastName,

        @Schema(description = "Registered phone number")
        String phoneNumber,

        @Schema(description = "Medical specialization", example = "CARDIOLOGY")
        Specialization specialization,

        @Schema(description = "Highest qualification", example = "MBBS, MD")
        String qualification,

        @Schema(description = "Timestamp when the doctor account was created")
        Instant createdAt
) {
}