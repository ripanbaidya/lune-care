package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.ClinicType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Clinic details associated with a doctor")
@Builder
public record ClinicResponse(

        @Schema(description = "Clinic ID")
        String id,

        @Schema(description = "Clinic name")
        String name,

        @Schema(description = "Clinic type — IN_PERSON or ONLINE")
        ClinicType type,

        @Schema(description = "Consultation fees in INR")
        BigDecimal consultationFees,

        @Schema(description = "Duration per consultation slot in minutes")
        Integer consultationDurationMinutes,

        @Schema(description = "Clinic contact number")
        String contactNumber,

        @Schema(description = "Street address")
        String addressLine,

        @Schema(description = "City")
        String city,

        @Schema(description = "State")
        String state,

        @Schema(description = "PIN code")
        String pincode,

        @Schema(description = "Country")
        String country,

        @Schema(description = "Whether the clinic is currently active")
        boolean active,

        @Schema(description = "Weekly schedule entries for this clinic")
        List<ClinicScheduleResponse> schedules
) {}