package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.request.CreateDoctorProfileRequest;
import com.healthcare.doctor.payload.request.UpdateVerificationStatusRequest;
import com.healthcare.doctor.payload.response.DoctorDocumentResponse;
import com.healthcare.doctor.payload.response.DoctorSummaryResponse;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.service.DoctorDocumentService;
import com.healthcare.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/internal/doctor")
@RequiredArgsConstructor
public class InternalDoctorController {

    private final DoctorService doctorService;
    private final ClinicService clinicService;
    private final DoctorDocumentService documentService;

    @PostMapping("/create-profile")
    public ResponseEntity<Void> createProfile(
            @Valid @RequestBody CreateDoctorProfileRequest request
    ) {
        doctorService.creteProfile(request);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/clinics/{clinicId}/fees")
    public ResponseEntity<BigDecimal> getClinicFees(@PathVariable String clinicId) {
        return ResponseEntity.ok(clinicService.getClinicFees(clinicId));
    }

    @GetMapping("/pending-verification")
    public ResponseEntity<List<DoctorSummaryResponse>> getDoctorsPendingVerification() {
        return ResponseEntity.ok(doctorService.getDoctorsPendingVerification());
    }

    @GetMapping("/{doctorId}/documents")
    public ResponseEntity<List<DoctorDocumentResponse>> getDoctorDocuments(
            @PathVariable String doctorId
    ) {
        return ResponseEntity.ok(documentService.getDocuments(doctorId));
    }

    // Called by admin-service after approve/reject decision
    @PatchMapping("/{doctorId}/verification-status")
    public ResponseEntity<Void> updateVerificationStatus(
            @PathVariable String doctorId,
            @Valid @RequestBody UpdateVerificationStatusRequest request
    ) {
        doctorService.updateVerificationStatus(doctorId, request);
        return ResponseEntity.ok().build();
    }
}
