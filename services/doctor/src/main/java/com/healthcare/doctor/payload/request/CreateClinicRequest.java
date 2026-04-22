package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.ClinicType;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record CreateClinicRequest(

        @NotBlank(message = "Clinic name is required")
        String name,

        @NotNull(message = "Clinic type is required")
        ClinicType type,

        @NotNull(message = "Consultation fees is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Fees must be greater than zero")
        BigDecimal consultationFees,

        @NotNull(message = "Consultation duration is required")
        @Min(value = 10, message = "Minimum consultation duration is 10 minutes")
        @Max(value = 120, message = "Maximum consultation duration is 120 minutes")
        Integer consultationDurationMinutes,

        String contactNumber,

        @NotBlank(message = "Address line is required")
        String addressLine,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "State is required")
        String state,

        @NotBlank(message = "Pincode is required")
        String pincode,

        String country

) {
}