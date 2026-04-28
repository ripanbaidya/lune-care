package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.DocumentType;
import lombok.Builder;

import java.time.Instant;

@Builder
public record DoctorDocumentResponse(
        String id,
        DocumentType documentType,
        String documentUrl,
        Instant uploadedAt
) {
}