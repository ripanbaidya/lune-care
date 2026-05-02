package com.healthcare.admin.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        name = "OverviewResponse",
        description = "Aggregated metrics for admin dashboard overview"
)
public record OverviewResponse(

        @Schema(
                description = "Total number of registered doctors in the system",
                example = "120"
        )
        long totalDoctors,

        @Schema(
                description = "Number of doctors pending verification approval",
                example = "15"
        )
        long pendingVerifications,

        @Schema(
                description = "Total number of registered patients",
                example = "540"
        )
        long totalPatients

) {
}