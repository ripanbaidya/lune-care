package com.healthcare.feedback.payload.response;

import com.healthcare.feedback.payload.dto.success.PageInfo;
import lombok.Builder;

import java.util.List;

/**
 * Response shape for {@code GET /api/feedback/doctor/{doctorId}}
 * Combines the aggregated summary with the paginated individual reviews.
 */
@Builder
public record DoctorFeedbackSummary(
        String doctorId,
        double averageRating,
        long totalReviews,
        List<FeedbackResponse> content,
        PageInfo page
) {
}