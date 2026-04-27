package com.healthcare.feedback.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Persisted feedback document.
 * <p><b>Uniqueness:</b> One feedback per appointment, enforced via a unique
 * index on {@code appointmentId}. If a patient deletes their feedback the
 * unique index entry is also removed, allowing re-submission.
 * <p><b>Index strategy:</b>
 * <ul>
 *   <li>{@code appointmentId} — unique, prevents duplicate submissions</li>
 *   <li>{@code doctorId} — fast lookup for doctor's public feedback page</li>
 *   <li>{@code patientId} — fast lookup for patient's submitted feedback</li>
 * </ul>
 */
@Document(collection = "feedbacks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    private String id;

    /**
     * One feedback per appointment — unique index prevents duplicates.
     */
    @Indexed(unique = true)
    private String appointmentId;

    @Indexed
    private String doctorId;

    @Indexed
    private String patientId;

    /**
     * Rating between 1 and 5 inclusive.
     * Validated at the request layer via {@code @Min(1) @Max(5)}.
     */
    private int rating;

    /**
     * Optional free-text review.
     */
    private String comment;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}