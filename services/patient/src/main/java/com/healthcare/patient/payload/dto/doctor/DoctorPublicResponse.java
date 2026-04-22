package com.healthcare.patient.payload.dto.doctor;

import java.util.List;

public record DoctorPublicResponse(
        String id,
        String firstName,
        String lastName,
        String profilePhotoUrl,
        String specialization,
        String qualification,
        Integer yearsOfExperience,
        String bio,
        List<String> languagesSpoken,
        List<ClinicResponse> clinics

) {
}