package com.healthcare.admin.controller;

import com.healthcare.admin.payload.dto.success.ResponseWrapper;
import com.healthcare.admin.payload.response.PendingDoctorResponse;
import com.healthcare.admin.payload.request.RejectDoctorRequest;
import com.healthcare.admin.payload.response.OverviewResponse;
import com.healthcare.admin.service.AdminService;
import com.healthcare.admin.util.ResponseUtil;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Admin",
        description = "Administrative endpoints for managing doctors, verifications, and platform analytics. " +
                "Accessible only by users with ROLE_ADMIN."
)
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_ADMIN required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class AdminController {

    private final AdminService adminService;

    @Operation(
            summary = "Get pending doctor verifications",
            description = """
                    Returns all doctors who are currently in PENDING_VERIFICATION status.
                    
                    Each doctor includes submitted documents (license, ID proof, etc.)
                    so that the admin can review and decide whether to approve or reject.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "Pending doctors fetched successfully"
    )
    @GetMapping("/doctors/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ResponseWrapper<List<PendingDoctorResponse>>> getPendingDoctors() {
        var response = adminService.getPendingDoctors();
        return ResponseUtil.ok("Doctor pending list fetched successfully", response);
    }

    @Operation(
            summary = "Approve doctor verification",
            description = """
                    Approves a doctor and activates their account.
                    
                    Effects:
                    - Updates doctor status to ACTIVE
                    - Grants full platform access
                    - Syncs status across doctor-service and auth-service
                    """
    )
    @ApiResponse(responseCode = "200", description = "Doctor verified successfully")
    @ApiResponse(responseCode = "404", description = "Doctor not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping("/doctors/{doctorId}/verify")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> verifyDoctor(
            @Parameter(
                    description = "Unique identifier of the doctor to verify",
                    example = "doc-12345"
            )
            @PathVariable String doctorId
    ) {
        adminService.verifyDoctor(doctorId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Reject doctor verification",
            description = """
                    Rejects a doctor's verification request.
                    
                    Effects:
                    - Doctor status is reverted to ONBOARDING
                    - Doctor must resubmit documents
                    - Rejection reason is stored and may be shown to the doctor
                    """
    )
    @ApiResponse(responseCode = "204", description = "Doctor rejected successfully")
    @ApiResponse(responseCode = "404", description = "Doctor not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping("/doctors/{doctorId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> rejectDoctor(

            @Parameter(
                    description = "Unique identifier of the doctor to reject",
                    example = "doc-67890"
            )
            @PathVariable String doctorId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Rejection details including reason",
                    required = true,
                    content = @Content(schema = @Schema(implementation = RejectDoctorRequest.class))
            )
            @Valid @RequestBody RejectDoctorRequest request
    ) {
        adminService.rejectDoctor(doctorId, request.reason());
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get platform overview metrics",
            description = """
                    Returns aggregated statistics for the admin dashboard.
                    
                    Includes:
                    - Total number of doctors
                    - Number of pending verifications
                    - Total number of patients
                    
                    Used for high-level monitoring and analytics.
                    """
    )
    @ApiResponse(
            responseCode = "200",
            description = "Overview metrics fetched successfully"
    )
    @GetMapping("/analytics/overview")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ResponseWrapper<OverviewResponse>> getOverview() {
        return ResponseUtil.ok(
                "Overview metrics fetched successfully",
                adminService.getOverview());
    }
}