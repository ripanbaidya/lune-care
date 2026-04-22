package com.healthcare.patient.controller;

import com.healthcare.patient.enums.ErrorCode;
import com.healthcare.patient.exception.CloudinaryException;
import com.healthcare.patient.payload.dto.success.ResponseWrapper;
import com.healthcare.patient.payload.request.UpdateProfileRequest;
import com.healthcare.patient.payload.response.PatientProfileResponse;
import com.healthcare.patient.service.PatientService;
import com.healthcare.patient.util.ResponseUtil;
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
        name = "Patient Profile",
        description = "Endpoints for managing patient profile"
)
@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> getProfile(
            @AuthenticationPrincipal String userId) {

        var response = patientService.getProfile(userId);

        return ResponseUtil.ok("Patient profile fetched successfully!", response);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> updateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        var response = patientService.updateProfile(userId, request);

        return ResponseUtil.ok("Patient profile updated successfully!", response);

    }

    @PatchMapping(
            value = "/profile/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> uploadPhoto(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new CloudinaryException(ErrorCode.VALIDATION_FAILED);
        }

        var response = patientService.uploadProfilePhoto(userId, file);
        return ResponseUtil.ok("Profile photo uploaded successfully!", response);
    }

    @DeleteMapping("/profile/photo")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> removePhoto(
            @AuthenticationPrincipal String userId
    ) {
        var response = patientService.removeProfilePhoto(userId);

        return ResponseUtil.ok("Profile photo removed successfully!", response);
    }
}