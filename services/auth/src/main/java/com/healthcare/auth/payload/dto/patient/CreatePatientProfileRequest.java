package com.healthcare.auth.payload.dto.patient;

import lombok.Builder;

@Builder
public record CreatePatientProfileRequest(
        String userId,
        String firstName,
        String lastName,
        String phoneNumber
) {
}
