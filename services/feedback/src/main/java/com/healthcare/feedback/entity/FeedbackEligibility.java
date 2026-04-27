package com.healthcare.feedback.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Eligibility record created when {@code appointment.completed} event is received.
 * <p>Feedback-service never calls appointment-service at submission time.
 * Instead, when a patient submits feedback, this collection is checked locally
 * to verify the appointment was completed and belongs to that patient.
 * <p>This keeps feedback-service fully decoupled from appointment-service
 * at runtime — no Feign call, no synchronous dependency.
 * <p><b>Indexes:</b>
 * <ul>
 *   <li>{@code appointmentId} — unique, one eligibility record per appointment</li>
 *   <li>{@code patientId} — scoped ownership check during submission</li>
 * </ul>
 */
@Document(collection = "feedback_eligibility")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackEligibility {

    @Id
    private String id;

    @Indexed(unique = true)
    private String appointmentId;

    private String patientId;

    private String doctorId;

    @CreatedDate
    private Instant createdAt;
}