package com.healthcare.admin.payload.response;

import java.time.Instant;
import java.util.List;

public record PendingDoctorResponse(
        String id,
        String userId,
        String firstName,
        String lastName,
        String phoneNumber,
        String specialization,
        String qualification,
        Instant createdAt,
        List<DoctorDocumentResponse> documents
) {
}