package com.healthcare.patient.controller;

import com.healthcare.patient.enums.ErrorCode;
import com.healthcare.patient.exception.CloudinaryException;
import com.healthcare.patient.payload.dto.success.ResponseWrapper;
import com.healthcare.patient.payload.request.UpdateProfileRequest;
import com.healthcare.patient.payload.response.PatientProfileResponse;
import com.healthcare.patient.service.PatientService;
import com.healthcare.patient.util.ResponseUtil;
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

@Tag(name = "Patient Profile", description = "Endpoints for managing patient profile")
@RestController
@RequestMapping("/api/patient/profile")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_PATIENT required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class PatientController {

    private final PatientService patientService;

    @Operation(
            summary = "Get patient profile",
            description = "Returns the full profile of the currently authenticated patient"
    )
    @ApiResponse(responseCode = "200", description = "Profile fetched successfully")
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> getProfile(
            @AuthenticationPrincipal String userId
    ) {
        var response = patientService.getProfile(userId);
        return ResponseUtil.ok("Patient profile fetched successfully!", response);
    }

    @Operation(
            summary = "Update patient profile",
            description = "Updates editable profile fields — all fields are optional"
    )
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> updateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        var response = patientService.updateProfile(userId, request);
        return ResponseUtil.ok("Patient profile updated successfully!", response);
    }

    @Operation(
            summary = "Upload profile photo",
            description = "Uploads a profile photo to Cloudinary and links it to the patient profile"
    )
    @ApiResponse(responseCode = "200", description = "Profile photo uploaded successfully")
    @ApiResponse(responseCode = "400", description = "File is empty or invalid",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @Operation(
            summary = "Remove profile photo",
            description = "Deletes the patient's profile photo from Cloudinary and unlinks it"
    )
    @ApiResponse(responseCode = "200", description = "Profile photo removed successfully")
    @DeleteMapping("/remove-photo")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PatientProfileResponse>> removePhoto(
            @AuthenticationPrincipal String userId
    ) {
        var response = patientService.removeProfilePhoto(userId);
        return ResponseUtil.ok("Profile photo removed successfully!", response);
    }
}