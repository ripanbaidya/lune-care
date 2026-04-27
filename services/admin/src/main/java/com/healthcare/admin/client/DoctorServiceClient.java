package com.healthcare.admin.client;

import com.healthcare.admin.payload.response.DoctorDocumentResponse;
import com.healthcare.admin.payload.response.DoctorSummaryResponse;
import com.healthcare.admin.payload.request.UpdateVerificationStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "DOCTOR",
        path = "/api/internal/doctor"
)
public interface DoctorServiceClient {

    @GetMapping("/pending-verification")
    List<DoctorSummaryResponse> getDoctorsPendingVerification();

    @GetMapping("/{doctorId}/documents")
    List<DoctorDocumentResponse> getDoctorDocuments(@PathVariable String doctorId);

    @PatchMapping("/{doctorId}/verification-status")
    void updateVerificationStatus(
            @PathVariable String doctorId,
            @RequestBody UpdateVerificationStatusRequest request
    );
}