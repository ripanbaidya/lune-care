package com.healthcare.feedback.payload.request;

import jakarta.validation.constraints.*;

public record SubmitFeedbackRequest(

        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        @NotNull(message = "Rating is required")
        @DecimalMin(value = "1.0", inclusive = true, message = "Rating must be at least 1")
        @DecimalMax(value = "5.0", inclusive = true, message = "Rating must be at most 5")
        Double rating,

        String comment
) {
}