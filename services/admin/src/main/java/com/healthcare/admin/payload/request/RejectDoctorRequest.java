package com.healthcare.admin.payload.request;

import jakarta.validation.constraints.NotBlank;

public record RejectDoctorRequest(
        @NotBlank(message = "Rejection reason is required")
        String reason
) {
}