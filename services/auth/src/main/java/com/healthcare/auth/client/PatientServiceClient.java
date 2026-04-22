package com.healthcare.auth.client;

import com.healthcare.auth.payload.dto.patient.CreatePatientProfileRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "PATIENT")
public interface PatientServiceClient {

    @PostMapping(
            value = "/api/internal/patient/create-profile",
            consumes = "application/json"
    )
    void createProfile(@RequestBody CreatePatientProfileRequest request);
}
