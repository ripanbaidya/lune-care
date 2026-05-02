package com.healthcare.feedback.payload.response;

import com.healthcare.feedback.payload.dto.success.PageInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;

@Schema(
        description = "Aggregated feedback summary for a doctor including average rating, " +
                "total reviews and paginated individual reviews"
)
@Builder
public record DoctorFeedbackSummary(

        @Schema(description = "Doctor's profile ID")
        String doctorId,

        @Schema(description = "Average rating across all reviews", example = "4.3")
        double averageRating,

        @Schema(description = "Total number of reviews submitted for this doctor", example = "128")
        long totalReviews,

        @Schema(description = "Paginated list of individual feedback entries for the current page")
        List<FeedbackResponse> content,

        @Schema(description = "Pagination metadata")
        PageInfo page
) {
}