package com.healthcare.admin.payload.response;

public record OverviewResponse(
        long totalDoctors,
        long pendingVerifications,
        long totalPatients
) {
}