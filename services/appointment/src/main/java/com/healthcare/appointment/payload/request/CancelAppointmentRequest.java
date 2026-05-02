package com.healthcare.appointment.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for cancelling an appointment — reason is optional")
public record CancelAppointmentRequest(

        @Schema(
                description = "Reason for cancellation. Defaults to 'No reason provided' if blank",
                example = "Doctor unavailable"
        )
        String reason
) {
    public CancelAppointmentRequest {
        reason = (reason == null || reason.isBlank())
                ? "No reason provided"
                : reason;
    }
}