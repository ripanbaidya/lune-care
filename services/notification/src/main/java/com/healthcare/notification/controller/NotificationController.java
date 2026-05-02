package com.healthcare.notification.controller;

import com.healthcare.notification.payload.dto.success.ResponseWrapper;
import com.healthcare.notification.payload.response.NotificationResponse;
import com.healthcare.notification.service.NotificationService;
import com.healthcare.notification.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(
        name = "Notifications",
        description = "Endpoints for retrieving and managing notifications. " +
                "Accessible by both patients and doctors."
)
@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_PATIENT or ROLE_DOCTOR required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(
            summary = "Get notifications",
            description = """
                    Returns paginated notifications for the authenticated user.
                    
                    **Filtering by read status:**
                    - `isRead=true` — returns only read notifications
                    - `isRead=false` — returns only unread notifications
                    - omit `isRead` — returns all notifications
                    """
    )
    @ApiResponse(responseCode = "200", description = "Notifications fetched successfully")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getNotifications(
            @AuthenticationPrincipal String userId,
            @Parameter(
                    description = "Optional read status filter. " +
                            "true = read only, false = unread only, omit = all"
            )
            @RequestParam(required = false) Boolean isRead,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<NotificationResponse> result =
                notificationService.getNotifications(userId, isRead, page, size);
        return ResponseUtil.paginated("Notifications fetched successfully", result);
    }

    @Operation(
            summary = "Get unread notification count",
            description = "Returns the count of unread notifications for the authenticated user. " +
                    "Used for rendering the notification badge in the UI."
    )
    @ApiResponse(responseCode = "200", description = "Unread count fetched successfully",
            content = @Content(schema = @Schema(
                    example = "{\"success\": true, \"data\": {\"unreadCount\": 5}}"
            ))
    )
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal String userId
    ) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseUtil.ok("Unread count fetched successfully", Map.of("unreadCount", count));
    }

    @Operation(
            summary = "Mark notification as read",
            description = "Marks a single notification as read for the authenticated user. " +
                    "Returns the updated notification."
    )
    @ApiResponse(responseCode = "200", description = "Notification marked as read successfully")
    @ApiResponse(responseCode = "404", description = "Notification not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Notification document ID to mark as read")
            @PathVariable String notificationId
    ) {
        NotificationResponse response = notificationService.markAsRead(notificationId, userId);
        return ResponseUtil.ok("Notification marked as read", response);
    }

    @Operation(
            summary = "Mark all notifications as read",
            description = "Bulk marks all unread notifications as read for the authenticated user"
    )
    @ApiResponse(responseCode = "200", description = "All notifications marked as read")
    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Void>> markAllAsRead(
            @AuthenticationPrincipal String userId
    ) {
        notificationService.markAllAsRead(userId);
        return ResponseUtil.ok("All notifications marked as read");
    }

    @Operation(
            summary = "Delete a notification",
            description = "Permanently deletes a single notification by ID. " +
                    "Only the recipient of the notification can delete it."
    )
    @ApiResponse(responseCode = "204", description = "Notification deleted successfully")
    @ApiResponse(responseCode = "404", description = "Notification not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteById(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Notification document ID to delete")
            @PathVariable String notificationId
    ) {
        notificationService.deleteById(notificationId, userId);
        return ResponseUtil.noContent();
    }

    @Operation(
            summary = "Delete all notifications",
            description = "Permanently deletes all notifications for the authenticated user"
    )
    @ApiResponse(responseCode = "204", description = "All notifications deleted successfully")
    @DeleteMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal String userId
    ) {
        notificationService.deleteAll(userId);
        return ResponseUtil.noContent();
    }
}