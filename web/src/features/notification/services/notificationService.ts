import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {NotificationPage, NotificationResponse} from '../types/notification.types';

export const notificationService = {

    /**
     * GET /api/notification
     * isRead: undefined = all, true = read only, false = unread only
     */
    getNotifications: async (
        page = 0,
        size = 15,
        isRead?: boolean,
    ): Promise<ResponseWrapper<NotificationPage>> => {
        const params: Record<string, string | number | boolean> = {page, size};
        if (isRead !== undefined) params.isRead = isRead;
        const res = await apiClient.get<ResponseWrapper<NotificationPage>>('/notification', {params});
        return res.data;
    },

    /** GET /api/notification/unread-count */
    getUnreadCount: async (): Promise<ResponseWrapper<{ unreadCount: number }>> => {
        const res = await apiClient.get<ResponseWrapper<{ unreadCount: number }>>(
            '/notification/unread-count',
        );
        return res.data;
    },

    /** PATCH /api/notification/:id/read */
    markAsRead: async (notificationId: string): Promise<ResponseWrapper<NotificationResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<NotificationResponse>>(
            `/notification/${notificationId}/read`,
        );
        return res.data;
    },

    /** PATCH /api/notification/read-all */
    markAllAsRead: async (): Promise<ResponseWrapper<void>> => {
        const res = await apiClient.patch<ResponseWrapper<void>>('/notification/read-all');
        return res.data;
    },

    /** DELETE /api/notification/:id */
    deleteById: async (notificationId: string): Promise<void> => {
        await apiClient.delete(`/notification/${notificationId}`);
    },

    /** DELETE /api/notification/all */
    deleteAll: async (): Promise<void> => {
        await apiClient.delete('/notification/all');
    },
};