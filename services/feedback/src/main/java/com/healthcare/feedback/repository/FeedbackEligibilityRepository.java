package com.healthcare.feedback.repository;

import com.healthcare.feedback.entity.FeedbackEligibility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackEligibilityRepository extends MongoRepository<FeedbackEligibility, String> {

    /**
     * Find eligibility record by appointmentId and patientId.
     * Both must match — prevents a patient from submitting feedback for another patient's appointment.
     */
    Optional<FeedbackEligibility> findByAppointmentIdAndPatientId(String appointmentId, String patientId);

    /**
     * Check if feedback eligibility already exists for this appointment.
     */
    boolean existsByAppointmentId(String appointmentId);

}
