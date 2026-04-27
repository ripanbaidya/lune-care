package com.healthcare.admin.controller;

import com.healthcare.admin.payload.response.PendingDoctorResponse;
import com.healthcare.admin.payload.request.RejectDoctorRequest;
import com.healthcare.admin.payload.response.OverviewResponse;
import com.healthcare.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Returns all doctors with PENDING_VERIFICATION status including their submitted documents.
     * Admin uses this to review and decide approve/reject.
     */
    @GetMapping("/doctors/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PendingDoctorResponse>> getPendingDoctors() {
        return ResponseEntity.ok(adminService.getPendingDoctors());
    }

    /**
     * Approve a doctor — sets status to ACTIVE in both doctor-service and auth-service.
     */
    @PatchMapping("/doctors/{doctorId}/verify")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> verifyDoctor(@PathVariable String doctorId) {
        adminService.verifyDoctor(doctorId);
        return ResponseEntity.ok().build();
    }

    /**
     * Reject a doctor — sets status back to ONBOARDING so they can resubmit documents.
     * Rejection reason is required.
     */
    @PatchMapping("/doctors/{doctorId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> rejectDoctor(
            @PathVariable String doctorId,
            @Valid @RequestBody RejectDoctorRequest request
    ) {
        adminService.rejectDoctor(doctorId, request.reason());
        return ResponseEntity.noContent().build();
    }

    /**
     * Platform overview — pending verifications and (future) total user counts.
     */
    @GetMapping("/analytics/overview")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<OverviewResponse> getOverview() {
        return ResponseEntity.ok(adminService.getOverview());
    }
}