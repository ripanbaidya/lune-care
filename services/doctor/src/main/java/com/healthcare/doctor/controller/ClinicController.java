package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.CreateClinicRequest;
import com.healthcare.doctor.payload.request.UpdateClinicRequest;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Doctor Clinics", description = "Endpoints for managing clinics")
@RestController
@RequestMapping("/api/doctor/clinics")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_DOCTOR required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class ClinicController {

    private final ClinicService clinicService;

    @Operation(
            summary = "Add a new clinic",
            description = "Creates a new clinic linked to the authenticated doctor"
    )
    @ApiResponse(responseCode = "200", description = "Clinic added successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed on clinic fields",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<ClinicResponse>> addClinic(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateClinicRequest request
    ) {
        var response = clinicService.addClinic(userId, request);
        return ResponseUtil.ok("Clinic added successfully!", response);
    }

    @Operation(
            summary = "Get all clinics",
            description = "Returns all clinics associated with the authenticated doctor"
    )
    @ApiResponse(responseCode = "200", description = "Clinics fetched successfully")
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicResponse>>> getClinics(
            @AuthenticationPrincipal String userId
    ) {
        var response = clinicService.getClinics(userId);
        return ResponseUtil.ok("Clinics fetched successfully!", response);
    }

    @Operation(
            summary = "Update a clinic",
            description = "Updates details of an existing clinic. Only fields provided will be updated."
    )
    @ApiResponse(responseCode = "200", description = "Clinic updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Clinic not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PutMapping("/{clinicId}")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<ClinicResponse>> updateClinic(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "ID of the clinic to update") @PathVariable String clinicId,
            @Valid @RequestBody UpdateClinicRequest request
    ) {
        var response = clinicService.updateClinic(userId, clinicId, request);
        return ResponseUtil.ok("Clinic updated successfully!", response);
    }

    @Operation(
            summary = "Delete a clinic",
            description = "Soft-deletes a clinic by marking it inactive"
    )
    @ApiResponse(responseCode = "204", description = "Clinic deleted successfully")
    @ApiResponse(responseCode = "404", description = "Clinic not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @DeleteMapping("{clinicId}")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteClinic(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "ID of the clinic to delete") @PathVariable String clinicId
    ) {
        clinicService.deleteClinic(userId, clinicId);
        return ResponseUtil.noContent();
    }
}