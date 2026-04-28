package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record OnboardingRequest(

        @Email(message = "Invalid email format")
        String email,

        @NotNull(message = "Gender is required")
        Gender gender,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @NotNull(message = "Specialization is required")
        Specialization specialization,

        @NotBlank(message = "Qualification is required")
        String qualification,

        @NotNull(message = "Years of experience is required")
        @Min(value = 0, message = "Experience cannot be negative")
        @Max(value = 60, message = "Experience seems unrealistic")
        Integer yearsOfExperience,

        @Size(max = 250, message = "Bio cannot exceed 1000 characters")
        String bio,

        List<String> languagesSpoken

) {
}