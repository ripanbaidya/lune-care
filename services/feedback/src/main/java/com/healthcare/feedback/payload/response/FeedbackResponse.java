package com.healthcare.feedback.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;

@Schema(description = "Individual feedback entry details")
@Builder
public record FeedbackResponse(

        @Schema(description = "Feedback document ID")
        String id,

        @Schema(description = "Associated appointment ID")
        String appointmentId,

        @Schema(description = "Doctor's profile ID this feedback is for")
        String doctorId,

        @Schema(description = "Patient's user ID who submitted this feedback")
        String patientId,

        @Schema(description = "Rating given by the patient (1.0 to 5.0)", example = "4.5")
        double rating,

        @Schema(description = "Optional review comment")
        String comment,

        @Schema(description = "Timestamp when feedback was first submitted")
        Instant createdAt,

        @Schema(description = "Timestamp when feedback was last updated")
        Instant updatedAt
) {
}