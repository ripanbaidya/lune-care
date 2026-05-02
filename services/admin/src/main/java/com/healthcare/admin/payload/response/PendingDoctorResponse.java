package com.healthcare.admin.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(
        name = "PendingDoctorResponse",
        description = "Detailed information of a doctor pending verification, including uploaded documents"
)
public record PendingDoctorResponse(

        @Schema(description = "Unique identifier of the doctor", example = "doc-4567")
        String id,

        @Schema(description = "Associated user ID of the doctor", example = "user-98765")
        String userId,

        @Schema(description = "Doctor's first name", example = "Rahul")
        String firstName,

        @Schema(description = "Doctor's last name", example = "Sharma")
        String lastName,

        @Schema(description = "Contact phone number", example = "+919812345678")
        String phoneNumber,

        @Schema(description = "Medical specialization", example = "Dermatology")
        String specialization,

        @Schema(description = "Highest qualification", example = "MBBS, MD Dermatology")
        String qualification,

        @Schema(description = "Timestamp when the doctor profile was created")
        Instant createdAt,

        @Schema(
                description = "List of documents submitted by the doctor for verification"
        )
        List<DoctorDocumentResponse> documents

) {
}