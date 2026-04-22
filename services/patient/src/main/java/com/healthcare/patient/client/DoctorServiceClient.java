package com.healthcare.patient.client;

import com.healthcare.patient.payload.dto.doctor.DoctorPublicResponse;
import com.healthcare.patient.payload.dto.doctor.DoctorSearchRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

// TODO: Implement Feign fallback using Resilience4j to handle DOCTOR service downtime
@FeignClient(
        name = "DOCTOR",
        path = "/api/doctor"
)
public interface DoctorServiceClient {

    @GetMapping("/search")
    List<DoctorPublicResponse> search(@SpringQueryMap DoctorSearchRequest request);

    @GetMapping("/{doctorId}/public")
    DoctorPublicResponse getDoctorPublicProfile(@PathVariable String doctorId);
}
