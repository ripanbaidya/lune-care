package com.healthcare.doctor.payload.response;


import com.healthcare.doctor.enums.ClinicType;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record ClinicResponse(

        String id,
        String name,
        ClinicType type,
        BigDecimal consultationFees,
        Integer consultationDurationMinutes,
        String contactNumber,
        String addressLine,
        String city,
        String state,
        String pincode,
        String country,
        boolean active,
        List<ClinicScheduleResponse> schedules

) {
}