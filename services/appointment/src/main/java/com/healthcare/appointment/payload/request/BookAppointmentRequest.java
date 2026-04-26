package com.healthcare.appointment.payload.request;

import jakarta.validation.constraints.NotNull;

public record BookAppointmentRequest(

        @NotNull(message = "Slot ID is required")
        String slotId

) {
}