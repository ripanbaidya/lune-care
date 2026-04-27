package com.healthcare.notification.entity;

import com.healthcare.notification.enums.NotificationCategory;
import com.healthcare.notification.enums.NotificationType;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    /**
     * The userId of the person who should see this notification.
     */
    @Indexed
    private String recipientId;

    /**
     * Role of the recipient — ROLE_PATIENT or ROLE_DOCTOR.
     */
    private String recipientRole;

    /**
     * Specific event that triggered this notification.
     */
    private NotificationType type;

    /**
     * Broad grouping — for future category-based filtering.
     */
    private NotificationCategory category;

    /**
     * Short title shown in the notification list.
     */
    private String title;

    /**
     * Full notification message body.
     */
    private String body;

    /**
     * The ID of the domain object this notification relates to.
     * For appointment events this is the appointmentId.
     * Frontend can use this to deep-link to the relevant screen.
     */
    private String referenceId;

    @Indexed
    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    private Instant createdAt;
}