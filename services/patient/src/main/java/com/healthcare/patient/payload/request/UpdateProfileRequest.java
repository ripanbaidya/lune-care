package com.healthcare.patient.payload.request;

import com.healthcare.patient.enums.BloodGroup;
import com.healthcare.patient.enums.Gender;

import java.time.LocalDate;

public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String email,
        LocalDate dateOfBirth,
        Gender gender,
        BloodGroup bloodGroup
) {

}