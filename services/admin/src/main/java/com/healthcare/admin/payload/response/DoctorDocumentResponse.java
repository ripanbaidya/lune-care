package com.healthcare.admin.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(
        name = "DoctorDocumentResponse",
        description = "Details of a document uploaded by a doctor for verification"
)
public record DoctorDocumentResponse(

        @Schema(
                description = "Unique identifier of the document",
                example = "doc-123456"
        )
        String id,

        @Schema(
                description = "Type of the uploaded document",
                example = "MEDICAL_LICENSE",
                allowableValues = {"MEDICAL_LICENSE", "ID_PROOF", "DEGREE_CERTIFICATE"}
        )
        String documentType,

        @Schema(
                description = "Public or secured URL where the document is stored",
                example = "https://cdn.healthcare.com/docs/license-123.pdf"
        )
        String documentUrl,

        @Schema(
                description = "Timestamp when the document was uploaded"
        )
        Instant uploadedAt

) {
}