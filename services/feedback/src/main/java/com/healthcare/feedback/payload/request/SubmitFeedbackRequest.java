package com.healthcare.feedback.payload.request;

import jakarta.validation.constraints.*;

public record SubmitFeedbackRequest(

        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer rating,

        // Optional — patient may leave rating without a comment
        String comment
) {
}