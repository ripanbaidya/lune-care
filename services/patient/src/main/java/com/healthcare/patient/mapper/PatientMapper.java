package com.healthcare.patient.mapper;

import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.payload.response.PatientProfileResponse;

public final class PatientMapper {

    private PatientMapper() {
    }

    public static PatientProfileResponse toResponse(Patient patient) {
        return PatientProfileResponse.builder()
                .id(patient.getId())
                .userId(patient.getUserId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .phoneNumber(patient.getPhoneNumber())
                .email(patient.getEmail())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .profilePhotoUrl(patient.getProfilePhotoUrl())
                .build();
    }
}
