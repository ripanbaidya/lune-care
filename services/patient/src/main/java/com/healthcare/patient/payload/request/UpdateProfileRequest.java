package com.healthcare.patient.payload.request;

import com.healthcare.patient.enums.BloodGroup;
import com.healthcare.patient.enums.Gender;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Request payload for updating patient profile — all fields are optional")
public record UpdateProfileRequest(

        @Schema(description = "Updated first name", example = "Rahul")
        String firstName,

        @Schema(description = "Updated last name", example = "Sharma")
        String lastName,

        @Schema(description = "Updated email address", example = "rahul@gmail.com")
        String email,

        @Schema(description = "Updated date of birth (YYYY-MM-DD)", example = "1995-08-20")
        LocalDate dateOfBirth,

        @Schema(description = "Updated gender", example = "MALE")
        Gender gender,

        @Schema(description = "Updated blood group", example = "B_POSITIVE")
        BloodGroup bloodGroup
) {
}