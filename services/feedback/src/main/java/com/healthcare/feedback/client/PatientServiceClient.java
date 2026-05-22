package com.healthcare.feedback.client;

import com.healthcare.feedback.payload.dto.patient.PatientSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "PATIENT",
        path = "/api/internal/patient"
)
public interface PatientServiceClient {

    @GetMapping("/user/{userId}/summary")
    PatientSummaryResponse getPatientSummaryByUserId(@PathVariable String userId);
}
