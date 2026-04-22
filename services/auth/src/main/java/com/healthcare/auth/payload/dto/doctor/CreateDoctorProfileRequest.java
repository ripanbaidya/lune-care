package com.healthcare.auth.payload.dto.doctor;

import lombok.Builder;

@Builder
public record CreateDoctorProfileRequest(
        String userId,
        String firstName,
        String lastName,
        String phoneNumber
) {
}
