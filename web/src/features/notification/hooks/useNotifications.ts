import { useQueryClient } from '@tanstack/react-query';
import { useAppQuery } from '../../../shared/hooks/useAppQuery';
import { useAppMutation } from '../../../shared/hooks/useAppMutation';
import { notificationService } from '../services/notificationService';
import type { ResponseWrapper } from '../../../types/api.types';
import type { NotificationPage, NotificationResponse } from '../types/notification.types';

export const NOTIFICATION_LIST_KEY = ['notifications', 'list'] as const;
export const NOTIFICATION_UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;

/**
 * Polls unread notification count every 30 seconds.
 */
export function useUnreadNotificationCount() {
    return useAppQuery<ResponseWrapper<{ unreadCount: number }>>({
        queryKey: NOTIFICATION_UNREAD_COUNT_KEY,
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: 30_000,
        // Keep polling even when window is blurred (user on another tab)
        refetchIntervalInBackground: false,
        // Don't retry on auth errors — user may have logged out
        retry: (failureCount, error: any) => {
            if (error?.status === 401 || error?.status === 403) return false;
            return failureCount < 2;
        },
    });
}

/**
 * Paginated notifications list.
 */
export function useNotifications(page = 0, size = 15, isRead?: boolean) {
    return useAppQuery<ResponseWrapper<NotificationPage>>({
        queryKey: [...NOTIFICATION_LIST_KEY, page, size, isRead],
        queryFn: () => notificationService.getNotifications(page, size, isRead),
        staleTime: 10_000,
    });
}

/**
 * Marks a single notification as read.
 */
export function useMarkAsRead() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<NotificationResponse>, string>({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
            qc.invalidateQueries({ queryKey: NOTIFICATION_UNREAD_COUNT_KEY });
        },
    });
}

/**
 * Marks all notifications as read.
 */
export function useMarkAllAsRead() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<void>, void>({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
            // Immediately set count to 0 in cache — no need to wait for refetch
            qc.setQueryData(NOTIFICATION_UNREAD_COUNT_KEY, (old: any) => {
                if (!old) return old;
                return { ...old, data: { unreadCount: 0 } };
            });
        },
    });
}

/**
 * Deletes a single notification by ID.
 */
export function useDeleteNotification() {
    const qc = useQueryClient();
    return useAppMutation<void, string>({
        mutationFn: (id) => notificationService.deleteById(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
            qc.invalidateQueries({ queryKey: NOTIFICATION_UNREAD_COUNT_KEY });
        },
    });
}

/**
 * Deletes ALL notifications for the user.
 */
export function useDeleteAllNotifications() {
    const qc = useQueryClient();
    return useAppMutation<void, void>({
        mutationFn: () => notificationService.deleteAll(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATION_LIST_KEY });
            qc.setQueryData(NOTIFICATION_UNREAD_COUNT_KEY, (old: any) => {
                if (!old) return old;
                return { ...old, data: { unreadCount: 0 } };
            });
        },
    });
}