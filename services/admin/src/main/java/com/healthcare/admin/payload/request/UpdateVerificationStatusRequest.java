package com.healthcare.admin.payload.request;

import jakarta.validation.constraints.NotNull;

public record UpdateVerificationStatusRequest(
        @NotNull boolean approved,
        String rejectionReason
) {
}
