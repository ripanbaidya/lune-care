package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.ClinicType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;

import java.math.BigDecimal;

@Schema(description = "Request payload for updating clinic details — all fields are optional")
@Builder
public record UpdateClinicRequest(

        @Schema(description = "Updated clinic name", example = "Mehta Neuro Clinic")
        String name,

        @Schema(description = "Updated clinic type", example = "ONLINE")
        ClinicType type,

        @Schema(description = "Updated consultation fees in INR (must be > 0)", example = "700.00")
        @DecimalMin(value = "0.0", inclusive = false, message = "Fees must be greater than zero")
        BigDecimal consultationFees,

        @Schema(description = "Updated consultation duration in minutes (10–120)", example = "45")
        @Min(value = 10, message = "Minimum consultation duration is 10 minutes")
        @Max(value = 120, message = "Maximum consultation duration is 120 minutes")
        Integer consultationDurationMinutes,

        @Schema(description = "Updated contact number", example = "9123456789")
        String contactNumber,

        @Schema(description = "Updated street address", example = "45, CG Road")
        String addressLine,

        @Schema(description = "Updated city", example = "Surat")
        String city,

        @Schema(description = "Updated state", example = "Gujarat")
        String state,

        @Schema(description = "Updated PIN code", example = "395003")
        String pincode,

        @Schema(description = "Updated country", example = "India")
        String country
) {
}