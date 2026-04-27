package com.healthcare.notification.controller;

import com.healthcare.notification.payload.dto.success.ResponseWrapper;
import com.healthcare.notification.payload.response.NotificationResponse;
import com.healthcare.notification.service.NotificationService;
import com.healthcare.notification.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get paginated notifications for the logged-in user.
     *
     * @param isRead optional filter: {@code true} = read only, {@code false} = unread only, omit = all
     * @param page   0-based page number
     * @param size   items per page
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getNotifications(
            @AuthenticationPrincipal String userId,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<NotificationResponse> result =
                notificationService.getNotifications(userId, isRead, page, size);

        return ResponseUtil.paginated("Notifications fetched successfully", result);
    }

    /**
     * Get the count of unread notifications — used for the badge in the UI.
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal String userId
    ) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseUtil.ok("Unread count fetched successfully", Map.of("unreadCount", count));
    }

    /**
     * Mark a single notification as read.
     */
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal String userId,
            @PathVariable String notificationId
    ) {
        NotificationResponse response = notificationService.markAsRead(notificationId, userId);
        return ResponseUtil.ok("Notification marked as read", response);
    }

    /**
     * Mark all notifications as read for the logged-in user.
     */
    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Void>> markAllAsRead(
            @AuthenticationPrincipal String userId
    ) {
        notificationService.markAllAsRead(userId);
        return ResponseUtil.ok("All notifications marked as read");
    }

    /**
     * Delete a single notification by ID.
     */
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteById(
            @AuthenticationPrincipal String userId,
            @PathVariable String notificationId
    ) {
        notificationService.deleteById(notificationId, userId);
        return ResponseUtil.noContent();
    }

    /**
     * Delete all notifications for the logged-in user.
     */
    @DeleteMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal String userId
    ) {
        notificationService.deleteAll(userId);
        return ResponseUtil.noContent();
    }
}