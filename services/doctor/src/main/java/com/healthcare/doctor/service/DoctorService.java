package com.healthcare.doctor.service;

import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.payload.request.CreateDoctorProfileRequest;
import com.healthcare.doctor.payload.request.OnboardingRequest;
import com.healthcare.doctor.payload.request.UpdateDoctorProfileRequest;
import com.healthcare.doctor.payload.request.UpdateVerificationStatusRequest;
import com.healthcare.doctor.payload.response.DoctorProfileResponse;
import com.healthcare.doctor.payload.response.DoctorPublicResponse;
import com.healthcare.doctor.payload.response.DoctorSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface DoctorService {

    /**
     * Used by auth-service to create a patient profile when a new user is
     * registered. This is called via feign client.
     *
     * @param request the request object containing user details
     */
    void creteProfile(CreateDoctorProfileRequest request);

    DoctorProfileResponse getProfile(String userId);

    DoctorProfileResponse completeOnboarding(String userId, OnboardingRequest request);

    DoctorProfileResponse updateProfile(String userId, UpdateDoctorProfileRequest request);

    DoctorProfileResponse uploadProfilePhoto(String userId, MultipartFile file);

    DoctorProfileResponse removeProfilePhoto(String userId);

    Page<DoctorPublicResponse> search(String name, String specialization,
                                      String city, BigDecimal maxFees,
                                      int page, int size);

    DoctorPublicResponse getPublicProfile(String doctorId);

    Doctor findByUserId(String userId);

    List<DoctorSummaryResponse> getDoctorsPendingVerification();

    void updateVerificationStatus(String doctorId, UpdateVerificationStatusRequest request);
}
