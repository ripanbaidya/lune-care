package com.healthcare.appointment.payload.response;

import com.healthcare.appointment.enums.SlotStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Available slot details returned during slot lookup")
@Builder
public record SlotResponse(

        @Schema(description = "Slot ID")
        String id,

        @Schema(description = "Doctor's profile ID this slot belongs to")
        String doctorId,

        @Schema(description = "Clinic ID this slot belongs to")
        String clinicId,

        @Schema(description = "Date of the slot", example = "2025-06-15")
        LocalDate slotDate,

        @Schema(description = "Slot start time", example = "10:00")
        LocalTime startTime,

        @Schema(description = "Slot end time", example = "10:30")
        LocalTime endTime,

        @Schema(
                description = "Current status of the slot",
                example = "AVAILABLE",
                allowableValues = {"AVAILABLE", "LOCKED", "BOOKED", "CANCELLED"}
        )
        SlotStatus status
) {
}