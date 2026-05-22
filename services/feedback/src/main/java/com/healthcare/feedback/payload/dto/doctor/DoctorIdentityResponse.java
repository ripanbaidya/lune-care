package com.healthcare.feedback.payload.dto.doctor;

public record DoctorIdentityResponse(
        String userId,
        String firstName,
        String lastName,
        String fullName
) {
}
