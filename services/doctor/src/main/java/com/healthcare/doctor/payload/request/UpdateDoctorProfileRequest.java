package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Request payload for updating doctor profile — all fields are optional")
public record UpdateDoctorProfileRequest(

        @Schema(description = "Updated first name", example = "Anjali")
        String firstName,

        @Schema(description = "Updated last name", example = "Mehta")
        String lastName,

        @Schema(description = "Updated professional email", example = "dr.anjali@clinic.com")
        @Email
        String email,

        @Schema(description = "Updated gender", example = "FEMALE")
        Gender gender,

        @Schema(description = "Updated date of birth (must be in the past)", example = "1985-06-15")
        @Past
        LocalDate dateOfBirth,

        @Schema(description = "Updated specialization", example = "NEUROLOGY")
        Specialization specialization,

        @Schema(description = "Updated qualification", example = "MBBS, DM")
        String qualification,

        @Schema(description = "Updated years of experience (0–60)", example = "12")
        @Min(0) @Max(60)
        Integer yearsOfExperience,

        @Schema(description = "Updated bio (max 250 characters)")
        @Size(max = 250)
        String bio,

        @Schema(description = "Updated list of languages spoken", example = "[\"English\", \"Gujarati\"]")
        List<String> languagesSpoken
) {
}