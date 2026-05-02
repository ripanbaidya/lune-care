package com.healthcare.notification.payload.response;

import com.healthcare.notification.enums.NotificationCategory;
import com.healthcare.notification.enums.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;

@Schema(description = "Notification details returned to the authenticated user")
@Builder
public record NotificationResponse(

        @Schema(description = "Notification document ID")
        String id,

        @Schema(description = "User ID of the notification recipient")
        String recipientId,

        @Schema(
                description = "Role of the recipient",
                example = "ROLE_PATIENT",
                allowableValues = {"ROLE_PATIENT", "ROLE_DOCTOR"}
        )
        String recipientRole,

        @Schema(
                description = "Specific event that triggered this notification",
                example = "APPOINTMENT_CONFIRMED"
        )
        NotificationType type,

        @Schema(
                description = "Broad category for grouping notifications",
                example = "APPOINTMENT"
        )
        NotificationCategory category,

        @Schema(
                description = "Short title shown in the notification list",
                example = "Appointment Confirmed"
        )
        String title,

        @Schema(
                description = "Full notification message body",
                example = "Your appointment with Dr. Anjali Mehta on 15 Jun at 10:00 AM is confirmed."
        )
        String body,

        @Schema(
                description = "ID of the domain object this notification relates to. " +
                        "For appointment events this is the appointmentId. " +
                        "Frontend can use this to deep-link to the relevant screen.",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        String referenceId,

        @Schema(description = "Whether the notification has been read by the recipient")
        boolean isRead,

        @Schema(description = "Timestamp when the notification was created")
        Instant createdAt
) {
}