package com.healthcare.notification.service.impl;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.enums.ErrorCode;
import com.healthcare.notification.exception.NotificationException;
import com.healthcare.notification.mapper.NotificationMapper;
import com.healthcare.notification.payload.response.NotificationResponse;
import com.healthcare.notification.repository.NotificationRepository;
import com.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Returns paginated notifications for the logged-in user.
     *
     * @param isRead {@code null} = all, {@code true} = read only, {@code false} = unread only
     */
    @Override
    public Page<NotificationResponse> getNotifications(String recipientId,
                                                       Boolean isRead,
                                                       int page,
                                                       int size) {
        log.debug("Fetching notifications — recipientId: {}, isRead: {}, page: {}, size: {}",
                recipientId, isRead, page, size);

        PageRequest pageable = PageRequest.of(page, size);

        Page<Notification> result = (isRead != null)
                ? notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(
                recipientId, isRead, pageable)
                : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                recipientId, pageable);

        log.debug("Notifications fetched — recipientId: {}, total: {}", recipientId, result.getTotalElements());
        return result.map(NotificationMapper::toResponse);
    }

    @Override
    public long getUnreadCount(String recipientId) {
        long count = notificationRepository.countByRecipientIdAndIsRead(recipientId, false);
        log.debug("Unread count — recipientId: {}, count: {}", recipientId, count);
        return count;
    }

    @Override
    public NotificationResponse markAsRead(String notificationId, String recipientId) {
        log.debug("Marking notification as read — notificationId: {}, recipientId: {}",
                notificationId, recipientId);

        Notification notification = findOwnedNotification(notificationId, recipientId);

        if (notification.isRead()) {
            log.warn("Notification already read — notificationId: {}", notificationId);
            return NotificationMapper.toResponse(notification);
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        log.debug("Notification marked as read — notificationId: {}", notificationId);
        return NotificationMapper.toResponse(notification);
    }

    @Override
    public void markAllAsRead(String recipientId) {
        log.debug("Marking all notifications as read — recipientId: {}", recipientId);

        List<Notification> unread = notificationRepository
                .findAllByRecipientIdAndIsRead(recipientId, false);

        if (unread.isEmpty()) {
            log.warn("No unread notifications — recipientId: {}", recipientId);
            return;
        }

        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);

        log.debug("All notifications marked as read — recipientId: {}, count: {}",
                recipientId, unread.size());
    }

    @Override
    public void deleteById(String notificationId, String recipientId) {
        log.debug("Deleting notification — notificationId: {}, recipientId: {}",
                notificationId, recipientId);

        Notification notification = findOwnedNotification(notificationId, recipientId);
        notificationRepository.delete(notification);

        log.debug("Notification deleted — notificationId: {}", notificationId);
    }

    @Override
    public void deleteAll(String recipientId) {
        log.debug("Deleting all notifications — recipientId: {}", recipientId);
        notificationRepository.deleteAllByRecipientId(recipientId);
        log.debug("All notifications deleted — recipientId: {}", recipientId);
    }

    /*
     * Private helpers
     */

    /**
     * Finds a notification by ID and ensures it belongs to the requesting user.
     * Throws {@link NotificationException} with NOT_FOUND if not found or not owned.
     */
    private Notification findOwnedNotification(String notificationId, String recipientId) {
        return notificationRepository
                .findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> {
                    log.warn("Notification not found or not owned — notificationId: {}, recipientId: {}",
                            notificationId, recipientId);
                    return new NotificationException(ErrorCode.NOTIFICATION_NOT_FOUND);
                });
    }
}