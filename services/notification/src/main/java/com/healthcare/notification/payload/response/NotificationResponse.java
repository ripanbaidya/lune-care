package com.healthcare.notification.payload.response;

import com.healthcare.notification.enums.NotificationCategory;
import com.healthcare.notification.enums.NotificationType;
import lombok.Builder;

import java.time.Instant;

@Builder
public record NotificationResponse(
        String id,
        String recipientId,
        String recipientRole,
        NotificationType type,
        NotificationCategory category,
        String title,
        String body,
        String referenceId,
        boolean isRead,
        Instant createdAt
) {
}