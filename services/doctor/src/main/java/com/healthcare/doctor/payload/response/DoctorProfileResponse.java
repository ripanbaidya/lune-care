package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record DoctorProfileResponse(

        String id,
        String userId,
        String firstName,
        String lastName,
        String phoneNumber,
        String profilePhotoUrl,
        boolean onboardingCompleted,

        // Profile fields
        String email,
        Gender gender,
        LocalDate dateOfBirth,
        Specialization specialization,
        String qualification,
        Integer yearsOfExperience,
        String bio,
        List<String> languagesSpoken

) {
}