package com.healthcare.doctor.controller;

import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.CloudinaryException;
import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.OnboardingRequest;
import com.healthcare.doctor.payload.request.UpdateDoctorProfileRequest;
import com.healthcare.doctor.payload.response.DoctorProfileResponse;
import com.healthcare.doctor.service.DoctorService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Doctor Profile", description = "Endpoints for managing doctor profile")
@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_DOCTOR required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class DoctorController {

    private final DoctorService doctorService;

    @Operation(
            summary = "Get doctor profile",
            description = "Returns the full profile of the currently authenticated doctor"
    )
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> getProfile(
            @AuthenticationPrincipal String userId) {
        var response = doctorService.getProfile(userId);
        return ResponseUtil.ok("Doctor profile retrieved successfully", response);
    }

    @Operation(
            summary = "Update doctor profile",
            description = "Updates editable profile fields — all fields are optional"
    )
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> updateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateDoctorProfileRequest request
    ) {
        var response = doctorService.updateProfile(userId, request);
        return ResponseUtil.ok("Doctor profile updated successfully", response);
    }

    @Operation(
            summary = "Upload profile photo",
            description = "Uploads a profile photo to Cloudinary and links it to the doctor profile"
    )
    @ApiResponse(responseCode = "200", description = "Profile photo uploaded successfully")
    @ApiResponse(responseCode = "400", description = "File is empty or invalid")
    @PatchMapping(value = "/profile/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @Operation(
            summary = "Remove profile photo",
            description = "Deletes the doctor's profile photo from Cloudinary and unlinks it"
    )
    @ApiResponse(responseCode = "200", description = "Profile photo removed successfully")
    @DeleteMapping("/profile/remove-photo")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorProfileResponse>> removePhoto(
            @AuthenticationPrincipal String userId
    ) {
        var response = doctorService.removeProfilePhoto(userId);
        return ResponseUtil.ok("Profile photo removed successfully", response);
    }

    @Operation(
            summary = "Complete onboarding",
            description = "Submits professional details to complete the doctor onboarding flow. " +
                    "Must be called after registration before the doctor can use the platform."
    )
    @ApiResponse(responseCode = "200", description = "Onboarding completed successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed on onboarding fields")
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