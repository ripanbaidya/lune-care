package com.healthcare.patient.service;

import com.healthcare.patient.payload.request.CreateProfileRequest;
import com.healthcare.patient.payload.request.UpdateProfileRequest;
import com.healthcare.patient.payload.response.PatientProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PatientService {

    /**
     * Used by auth-service to create a patient profile when a new user is
     * registered. This is called via feign client.
     *
     * @param request the request object containing user details
     */
    void creteProfile(CreateProfileRequest request);

    PatientProfileResponse getProfile(String userId);

    PatientProfileResponse updateProfile(String userId, UpdateProfileRequest request);

    PatientProfileResponse uploadProfilePhoto(String userId, MultipartFile file);

    PatientProfileResponse removeProfilePhoto(String userId);

}
