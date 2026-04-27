package com.healthcare.admin.payload.response;

import java.time.Instant;

public record DoctorDocumentResponse(
        String id,
        String documentType,
        String documentUrl,
        Instant uploadedAt
) {
}