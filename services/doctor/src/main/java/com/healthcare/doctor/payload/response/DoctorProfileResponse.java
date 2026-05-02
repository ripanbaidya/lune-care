package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Full doctor profile visible to the authenticated doctor")
@Builder
public record DoctorProfileResponse(

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

        @Schema(description = "Cloudinary URL for profile photo")
        String profilePhotoUrl,

        @Schema(description = "Whether onboarding has been completed")
        boolean onboardingCompleted,

        @Schema(description = "Professional email address")
        String email,

        @Schema(description = "Gender")
        Gender gender,

        @Schema(description = "Date of birth")
        LocalDate dateOfBirth,

        @Schema(description = "Medical specialization")
        Specialization specialization,

        @Schema(description = "Highest qualification")
        String qualification,

        @Schema(description = "Years of clinical experience")
        Integer yearsOfExperience,

        @Schema(description = "Short professional bio")
        String bio,

        @Schema(description = "Languages the doctor can consult in")
        List<String> languagesSpoken
) {
}