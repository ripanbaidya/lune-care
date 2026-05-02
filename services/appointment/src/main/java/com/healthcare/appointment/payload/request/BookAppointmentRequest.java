package com.healthcare.appointment.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for booking an appointment")
public record BookAppointmentRequest(

        @Schema(
                description = "ID of the available slot to book",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        @NotNull(message = "Slot ID is required")
        String slotId
) {
}