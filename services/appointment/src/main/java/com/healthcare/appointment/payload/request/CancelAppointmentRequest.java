package com.healthcare.appointment.payload.request;

public record CancelAppointmentRequest(

        String reason
) {
    public CancelAppointmentRequest {
        reason = (reason == null || reason.isBlank())
                ? "No reason provided"
                : reason;
    }
}