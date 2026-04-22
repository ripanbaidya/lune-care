package com.healthcare.auth.client;

import com.healthcare.auth.payload.dto.doctor.CreateDoctorProfileRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "DOCTOR")
public interface DoctorServiceClient {

    @PostMapping(
            value = "/api/internal/doctor/create-profile",
            consumes = "application/json"
    )
    void createProfile(@RequestBody CreateDoctorProfileRequest request);
}
