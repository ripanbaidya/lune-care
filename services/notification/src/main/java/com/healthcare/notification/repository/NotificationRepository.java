package com.healthcare.notification.repository;

import com.healthcare.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    /**
     * All notifications for a user — paginated, optionally filtered by isRead.
     */
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    Page<Notification> findByRecipientIdAndIsReadOrderByCreatedAtDesc(
            String recipientId, boolean isRead, Pageable pageable);

    /**
     * Unread count badge
     */
    long countByRecipientIdAndIsRead(String recipientId, boolean isRead);

    /**
     * Find a single notification scoped to the recipient — prevents one user
     * from reading/deleting another user's notification.
     */
    Optional<Notification> findByIdAndRecipientId(String id, String recipientId);

    /**
     * Fetch ALL unread notifications for a user — used by markAllAsRead.
     */
    List<Notification> findAllByRecipientIdAndIsRead(String recipientId, boolean isRead);

    /**
     * Delete all notifications for a user — used by DELETE /api/notification/all
     */
    void deleteAllByRecipientId(String recipientId);
}