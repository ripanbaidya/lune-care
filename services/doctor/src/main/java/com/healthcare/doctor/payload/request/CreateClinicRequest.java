package com.healthcare.doctor.payload.request;

import com.healthcare.doctor.enums.ClinicType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;

@Schema(description = "Request payload for adding a new clinic")
@Builder
public record CreateClinicRequest(

        @Schema(description = "Clinic name", example = "Mehta Heart Clinic")
        @NotBlank(message = "Clinic name is required")
        String name,

        @Schema(description = "Type of clinic — IN_PERSON or ONLINE", example = "IN_PERSON")
        @NotNull(message = "Clinic type is required")
        ClinicType type,

        @Schema(description = "Consultation fees in INR (must be > 0)", example = "500.00")
        @NotNull(message = "Consultation fees is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Fees must be greater than zero")
        BigDecimal consultationFees,

        @Schema(description = "Duration of each consultation slot in minutes (10–120)", example = "30")
        @NotNull(message = "Consultation duration is required")
        @Min(value = 10, message = "Minimum consultation duration is 10 minutes")
        @Max(value = 120, message = "Maximum consultation duration is 120 minutes")
        Integer consultationDurationMinutes,

        @Schema(description = "Clinic contact number", example = "9876543210")
        String contactNumber,

        @Schema(description = "Street address", example = "12, MG Road")
        @NotBlank(message = "Address line is required")
        String addressLine,

        @Schema(description = "City", example = "Ahmedabad")
        @NotBlank(message = "City is required")
        String city,

        @Schema(description = "State", example = "Gujarat")
        @NotBlank(message = "State is required")
        String state,

        @Schema(description = "PIN code", example = "380001")
        @NotBlank(message = "Pincode is required")
        String pincode,

        @Schema(description = "Country (defaults to India)", example = "India")
        String country
) {
}