package com.healthcare.patient.payload.response;

import com.healthcare.patient.enums.BloodGroup;
import com.healthcare.patient.enums.Gender;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDate;

@Schema(description = "Full patient profile returned to the authenticated patient")
@Builder
public record PatientProfileResponse(

        @Schema(description = "Patient's internal profile ID")
        String id,

        @Schema(description = "Linked auth-service user ID")
        String userId,

        @Schema(description = "First name")
        String firstName,

        @Schema(description = "Last name")
        String lastName,

        @Schema(description = "Registered phone number")
        String phoneNumber,

        @Schema(description = "Email address")
        String email,

        @Schema(description = "Date of birth")
        LocalDate dateOfBirth,

        @Schema(description = "Gender")
        Gender gender,

        @Schema(description = "Blood group")
        BloodGroup bloodGroup,

        @Schema(description = "Cloudinary URL for profile photo")
        String profilePhotoUrl
) {
}