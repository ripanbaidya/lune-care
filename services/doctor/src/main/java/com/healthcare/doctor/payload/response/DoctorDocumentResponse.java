package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.DocumentType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;

@Schema(description = "Uploaded verification document details")
@Builder
public record DoctorDocumentResponse(

        @Schema(description = "Document record ID")
        String id,

        @Schema(description = "Type of document uploaded", example = "MEDICAL_LICENSE")
        DocumentType documentType,

        @Schema(description = "Cloudinary URL of the uploaded document")
        String documentUrl,

        @Schema(description = "Timestamp when the document was uploaded")
        Instant uploadedAt
) {
}