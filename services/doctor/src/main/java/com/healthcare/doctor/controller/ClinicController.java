package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.CreateClinicRequest;
import com.healthcare.doctor.payload.request.UpdateClinicRequest;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Doctor Clinics",
        description = "Endpoints for managing clinics"
)
@RestController
@RequestMapping("/api/doctor/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final ClinicService clinicService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<ClinicResponse>> addClinic(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateClinicRequest request
    ) {
        var response = clinicService.addClinic(userId, request);

        return ResponseUtil.ok("Clinic added successfully!", response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicResponse>>> getClinics(
            @AuthenticationPrincipal String userId) {

        var response = clinicService.getClinics(userId);

        return ResponseUtil.ok("Clinics fetched successfully!", response);
    }

    @PutMapping("/{clinicId}")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<ClinicResponse>> updateClinic(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId,
            @Valid @RequestBody UpdateClinicRequest request
    ) {
        var response = clinicService.updateClinic(userId, clinicId, request);

        return ResponseUtil.ok("Clinic updated successfully!", response);

    }

    @DeleteMapping("{clinicId}")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteClinic(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId
    ) {
        clinicService.deleteClinic(userId, clinicId);

        return ResponseUtil.noContent();
    }
}