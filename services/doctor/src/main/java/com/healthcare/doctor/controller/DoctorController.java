package com.healthcare.doctor.controller;

import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.CloudinaryException;
import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.OnboardingRequest;
import com.healthcare.doctor.payload.request.UpdateDoctorProfileRequest;
import com.healthcare.doctor.payload.response.DoctorProfileResponse;
import com.healthcare.doctor.service.DoctorService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(
        name = "Doctor Profile",
        description = "Endpoints for managing doctor profile"
)
@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> getProfile(
            @AuthenticationPrincipal String userId) {

        var response = doctorService.getProfile(userId);

        return ResponseUtil.ok("Doctor profile retrieved successfully", response);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> updateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateDoctorProfileRequest request
    ) {
        var response = doctorService.updateProfile(userId, request);

        return ResponseUtil.ok("Doctor profile updated successfully", response);

    }

    @PatchMapping(
            value = "/profile/upload-photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> uploadPhoto(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new CloudinaryException(ErrorCode.VALIDATION_FAILED);
        }

        var response = doctorService.uploadProfilePhoto(userId, file);
        return ResponseUtil.ok("Profile photo uploaded successfully", response);
    }

    @DeleteMapping("/profile/remove-photo")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> removePhoto(
            @AuthenticationPrincipal String userId
    ) {
        var response = doctorService.removeProfilePhoto(userId);

        return ResponseUtil.ok("Profile photo removed successfully", response);
    }


    @PostMapping("/onboarding/complete")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> completeOnboarding(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody OnboardingRequest request
    ) {
        var response = doctorService.completeOnboarding(userId, request);

        return ResponseUtil.ok("Doctor onboarding completed successfully", response);
    }
}