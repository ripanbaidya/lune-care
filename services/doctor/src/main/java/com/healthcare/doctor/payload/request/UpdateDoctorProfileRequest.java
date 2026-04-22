package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record UpdateDoctorProfileRequest(
        String firstName,
        String lastName,

        @Email
        String email,

        Gender gender,

        @Past
        LocalDate dateOfBirth,

        Specialization specialization,

        String qualification,

        @Min(0) @Max(60)
        Integer yearsOfExperience,

        @Size(max = 250)
        String bio,

        List<String> languagesSpoken
) {

}