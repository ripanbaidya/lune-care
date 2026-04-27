package com.healthcare.notification.mapper;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.payload.response.NotificationResponse;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipientId())
                .recipientRole(notification.getRecipientRole())
                .type(notification.getType())
                .category(notification.getCategory())
                .title(notification.getTitle())
                .body(notification.getBody())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}