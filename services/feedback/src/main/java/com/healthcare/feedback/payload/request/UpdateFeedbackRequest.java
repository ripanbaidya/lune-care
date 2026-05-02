package com.healthcare.feedback.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Request payload for updating an existing feedback entry")
public record UpdateFeedbackRequest(

        @Schema(
                description = "Updated rating for the doctor (1.0 to 5.0 inclusive)",
                example = "3.5"
        )
        @NotNull(message = "Rating is required")
        @DecimalMin(value = "1.0", inclusive = true, message = "Rating must be at least 1")
        @DecimalMax(value = "5.0", inclusive = true, message = "Rating must be at most 5")
        Double rating,

        @Schema(
                description = "Updated review comment",
                example = "Good doctor but waiting time was long."
        )
        String comment
) {
}