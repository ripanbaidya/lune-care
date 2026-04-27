package com.healthcare.feedback.repository;

import com.healthcare.feedback.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    /**
     * All feedback for a specific doctor — public paginated list.
     */
    Page<Feedback> findByDoctorIdOrderByCreatedAtDesc(String doctorId, Pageable pageable);

    /**
     * All feedback submitted by a specific patient — paginated.
     */
    Page<Feedback> findByPatientIdOrderByCreatedAtDesc(String patientId, Pageable pageable);

    /**
     * Check if feedback already exists for this appointment.
     * Used during submission to enforce one-per-appointment.
     */
    boolean existsByAppointmentId(String appointmentId);

    /**
     * Find feedback by appointmentId — used for update/delete ownership checks.
     */
    Optional<Feedback> findByAppointmentId(String appointmentId);

    /**
     * Compute average rating for a doctor.
     * Used alongside the paginated doctor feedback response.
     */
    @Query(value = "{ 'doctorId': ?0 }", fields = "{ 'rating': 1 }")
    Page<Feedback> findRatingsByDoctorId(String doctorId, Pageable pageable);

    /**
     * Count total reviews for a doctor — used for averageRating calculation.
     */
    long countByDoctorId(String doctorId);
}