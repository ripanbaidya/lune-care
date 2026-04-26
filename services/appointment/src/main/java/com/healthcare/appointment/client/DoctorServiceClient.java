package com.healthcare.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;

@FeignClient(
        name = "DOCTOR",
        path = "/api/internal/doctor"
)
public interface DoctorServiceClient {

    /**
     * Get clinic fees for a clinic ID
     *
     * @param clinicId the id of the clinic for which fees are to be fetched
     * @return clinic fees, 0 if a clinic is not found
     */
    @GetMapping("/clinics/{clinicId}/fees")
    BigDecimal getClinicFees(@PathVariable String clinicId);
}
