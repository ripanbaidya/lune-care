package com.healthcare.notification.service;

import com.healthcare.notification.payload.response.NotificationResponse;
import org.springframework.data.domain.Page;

public interface NotificationService {

    Page<NotificationResponse> getNotifications(String recipientId,
                                                Boolean isRead,
                                                int page, int size);

    long getUnreadCount(String recipientId);

    NotificationResponse markAsRead(String notificationId, String recipientId);

    void markAllAsRead(String recipientId);

    void deleteById(String notificationId, String recipientId);

    void deleteAll(String recipientId);
}