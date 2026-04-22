package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.ClinicType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record UpdateClinicRequest(

        String name,

        ClinicType type,

        @DecimalMin(value = "0.0", inclusive = false, message = "Fees must be greater than zero")
        BigDecimal consultationFees,

        @Min(value = 10, message = "Minimum consultation duration is 10 minutes")
        @Max(value = 120, message = "Maximum consultation duration is 120 minutes")
        Integer consultationDurationMinutes,

        String contactNumber,

        String addressLine,

        String city,

        String state,

        String pincode,

        String country

) {
}