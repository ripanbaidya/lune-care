package com.healthcare.admin.payload.request;

import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        name = "UpdateVerificationStatusRequest",
        description = "Request payload used by admin to approve or reject doctor verification"
)
public record UpdateVerificationStatusRequest(

        @Schema(
                description = "Indicates whether the doctor verification is approved or rejected",
                example = "true"
        )
        @NotNull
        boolean approved,

        @Schema(
                description = "Reason for rejection. Required only when approved is false",
                example = "Invalid registration number provided"
        )
        String rejectionReason

) {
}