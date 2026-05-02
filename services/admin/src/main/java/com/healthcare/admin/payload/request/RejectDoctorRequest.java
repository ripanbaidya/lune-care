package com.healthcare.admin.payload.request;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        name = "RejectDoctorRequest",
        description = "Request payload used by admin to reject a doctor verification request"
)
public record RejectDoctorRequest(

        @Schema(
                description = "Reason provided by admin for rejecting the doctor verification",
                example = "Incomplete medical license documentation"
        )
        @NotBlank(message = "Rejection reason is required")
        String reason

) {
}