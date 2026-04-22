package com.healthcare.doctor.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDoctorProfileRequest(

        @NotNull
        String userId,

        @NotBlank
        String firstName,

        @NotBlank
        String lastName,

        @NotBlank
        String phoneNumber
) {
}
