package com.healthcare.feedback.payload.response;

import lombok.Builder;

import java.time.Instant;

@Builder
public record FeedbackResponse(
        String id,
        String appointmentId,
        String doctorId,
        String patientId,
        int rating,
        String comment,
        Instant createdAt,
        Instant updatedAt
) {
}