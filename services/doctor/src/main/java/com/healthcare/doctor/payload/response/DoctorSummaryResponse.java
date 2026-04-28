package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.Specialization;
import lombok.Builder;

import java.time.Instant;

@Builder
public record DoctorSummaryResponse(
        String id,
        String userId,
        String firstName,
        String lastName,
        String phoneNumber,
        Specialization specialization,
        String qualification,
        Instant createdAt
) {
}