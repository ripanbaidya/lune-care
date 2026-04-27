package com.healthcare.feedback.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import java.util.Map;

/**
 * Custom aggregation repository for computing average rating.
 * Uses MongoDB's native {@code $avg} aggregation — efficient at any scale,
 * no need to load all documents into memory.
 */
@Repository
@RequiredArgsConstructor
public class FeedbackAggregationRepository {

    private final MongoTemplate mongoTemplate;

    /**
     * Computes the average rating for a doctor using MongoDB {@code $avg} aggregation.
     *
     * @param doctorId the doctor's ID
     * @return the average rating rounded to 1 decimal, or 0.0 if no reviews
     */
    public double computeAverageRating(String doctorId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("doctorId").is(doctorId)),
                Aggregation.group().avg("rating").as("avgRating")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(
                aggregation, "feedbacks", Map.class);

        Map result = results.getUniqueMappedResult();
        if (result == null || result.get("avgRating") == null) return 0.0;

        double avg = ((Number) result.get("avgRating")).doubleValue();
        return Math.round(avg * 10.0) / 10.0;
    }
}