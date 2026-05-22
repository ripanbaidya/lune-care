package com.healthcare.feedback.client;

import com.healthcare.feedback.payload.dto.doctor.DoctorIdentityResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "DOCTOR",
        path = "/api/internal/doctor"
)
public interface DoctorServiceClient {

    @GetMapping("/user/{userId}/summary")
    DoctorIdentityResponse getDoctorIdentityByUserId(@PathVariable String userId);
}
