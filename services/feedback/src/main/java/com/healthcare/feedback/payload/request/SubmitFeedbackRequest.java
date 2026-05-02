package com.healthcare.feedback.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Request payload for submitting feedback after a completed appointment")
public record SubmitFeedbackRequest(

        @Schema(
                description = "ID of the completed appointment this feedback is for",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        @Schema(
                description = "Rating for the doctor (1.0 to 5.0 inclusive)",
                example = "4.5"
        )
        @NotNull(message = "Rating is required")
        @DecimalMin(value = "1.0", inclusive = true, message = "Rating must be at least 1")
        @DecimalMax(value = "5.0", inclusive = true, message = "Rating must be at most 5")
        Double rating,

        @Schema(
                description = "Optional free-text review comment",
                example = "Very professional and thorough consultation."
        )
        String comment
) {}