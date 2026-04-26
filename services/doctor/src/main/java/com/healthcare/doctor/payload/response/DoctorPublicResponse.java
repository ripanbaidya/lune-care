package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.Specialization;
import lombok.Builder;

import java.util.List;

@Builder
public record DoctorPublicResponse(
        String id,
        String userId,
        String firstName,
        String lastName,
        String profilePhotoUrl,
        Specialization specialization,
        String qualification,
        Integer yearsOfExperience,
        String bio,
        List<String> languagesSpoken,
        List<ClinicResponse> clinics

) {
}