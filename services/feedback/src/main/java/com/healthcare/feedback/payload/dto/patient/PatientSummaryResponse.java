package com.healthcare.feedback.payload.dto.patient;

public record PatientSummaryResponse(
        String userId,
        String firstName,
        String lastName,
        String fullName
) {
}
