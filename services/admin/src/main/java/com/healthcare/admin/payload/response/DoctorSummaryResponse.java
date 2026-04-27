package com.healthcare.admin.payload.response;

import java.time.Instant;

public record DoctorSummaryResponse(
        String id,
        String userId,
        String firstName,
        String lastName,
        String phoneNumber,
        String specialization,
        String qualification,
        Instant createdAt
) {
}