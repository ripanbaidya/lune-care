package com.healthcare.patient.payload.response;

import com.healthcare.patient.enums.BloodGroup;
import com.healthcare.patient.enums.Gender;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record PatientProfileResponse(
        String id,
        String userId,
        String firstName,
        String lastName,
        String phoneNumber,
        String email,
        LocalDate dateOfBirth,
        Gender gender,
        BloodGroup bloodGroup,
        String profilePhotoUrl
) {
}