package com.healthcare.doctor.mapper;

import com.healthcare.doctor.entity.Clinic;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorProfile;
import com.healthcare.doctor.payload.response.DoctorProfileResponse;
import com.healthcare.doctor.payload.response.DoctorPublicResponse;
import com.healthcare.doctor.payload.response.DoctorSummaryResponse;

import java.util.Collections;
import java.util.List;

public final class DoctorMapper {

    private DoctorMapper() {
    }

    public static DoctorProfileResponse toProfileResponse(Doctor doctor) {
        DoctorProfile profile = doctor.getProfile();

        return DoctorProfileResponse.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .phoneNumber(doctor.getPhoneNumber())
                .profilePhotoUrl(doctor.getProfilePhotoUrl())
                .onboardingCompleted(doctor.isOnboardingCompleted())
                .email(profile != null ? profile.getEmail() : null)
                .gender(profile != null ? profile.getGender() : null)
                .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                .specialization(profile != null ? profile.getSpecialization() : null)
                .qualification(profile != null ? profile.getQualification() : null)
                .yearsOfExperience(profile != null ? profile.getYearsOfExperience() : null)
                .bio(profile != null ? profile.getBio() : null)
                .languagesSpoken(profile != null ? profile.getLanguagesSpoken() : Collections.emptyList())
                .build();
    }

    public static DoctorPublicResponse toPublicResponse(Doctor doctor, List<Clinic> clinics) {
        DoctorProfile profile = doctor.getProfile();

        return DoctorPublicResponse.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .profilePhotoUrl(doctor.getProfilePhotoUrl())
                .specialization(profile != null ? profile.getSpecialization() : null)
                .qualification(profile != null ? profile.getQualification() : null)
                .yearsOfExperience(profile != null ? profile.getYearsOfExperience() : null)
                .bio(profile != null ? profile.getBio() : null)
                .languagesSpoken(profile != null ? profile.getLanguagesSpoken() : Collections.emptyList())
                .clinics(clinics.stream().map(ClinicMapper::toClinicResponse).toList())
                .build();
    }

    public static DoctorSummaryResponse toSummaryResponse(Doctor doctor) {
        DoctorProfile profile = doctor.getProfile();
        return DoctorSummaryResponse.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .phoneNumber(doctor.getPhoneNumber())
                .specialization(profile != null ? profile.getSpecialization() : null)
                .qualification(profile != null ? profile.getQualification() : null)
                .createdAt(doctor.getCreatedAt())
                .build();
    }

}