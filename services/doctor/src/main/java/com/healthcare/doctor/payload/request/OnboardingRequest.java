package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Request payload for completing doctor onboarding")
@Builder
public record OnboardingRequest(

        @Schema(description = "Doctor's professional email address", example = "dr.anjali@hospital.com")
        @Email(message = "Invalid email format")
        String email,

        @Schema(description = "Doctor's gender", example = "FEMALE")
        @NotNull(message = "Gender is required")
        Gender gender,

        @Schema(description = "Date of birth in ISO format (YYYY-MM-DD)", example = "1985-06-15")
        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @Schema(description = "Medical specialization", example = "CARDIOLOGY")
        @NotNull(message = "Specialization is required")
        Specialization specialization,

        @Schema(description = "Highest medical qualification", example = "MBBS, MD")
        @NotBlank(message = "Qualification is required")
        String qualification,

        @Schema(description = "Years of clinical experience (0–60)", example = "10")
        @NotNull(message = "Years of experience is required")
        @Min(value = 0, message = "Experience cannot be negative")
        @Max(value = 60, message = "Experience seems unrealistic")
        Integer yearsOfExperience,

        @Schema(description = "Short professional bio (max 250 characters)", example = "Experienced cardiologist...")
        @Size(max = 250, message = "Bio cannot exceed 250 characters")
        String bio,

        @Schema(description = "Languages the doctor can consult in", example = "[\"Hindi\", \"English\"]")
        List<String> languagesSpoken

) {
}