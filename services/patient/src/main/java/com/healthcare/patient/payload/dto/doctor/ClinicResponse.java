package com.healthcare.patient.payload.dto.doctor;

import java.math.BigDecimal;
import java.util.List;

public record ClinicResponse(

        String id,
        String name,
        String type,
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