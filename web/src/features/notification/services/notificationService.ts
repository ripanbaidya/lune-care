import { apiClient } from '../../../lib/axios';
import type { ResponseWrapper } from '../../../types/api.types';
import type { NotificationPage, NotificationResponse } from '../types/notification.types';

export const notificationService = {

    /**
     * isRead: undefined = all, true = read only, false = unread only
     */
    getNotifications: async (page = 0, size = 15, isRead?: boolean,): Promise<ResponseWrapper<NotificationPage>> => {
        const params: Record<string, string | number | boolean> = { page, size };
        if (isRead !== undefined) params.isRead = isRead;
        const res = await apiClient.get<ResponseWrapper<NotificationPage>>('/notification', { params });
        return res.data;
    },

    /**
     * @returns Unread count of notifications
     */
    getUnreadCount: async (): Promise<ResponseWrapper<{ unreadCount: number }>> => {
        const res = await apiClient.get<ResponseWrapper<{ unreadCount: number }>>(
            '/notification/unread-count',
        );
        return res.data;
    },

    /**
     * Mark specific notification as read
     * @param notificationId  id of the notification
     */
    markAsRead: async (notificationId: string): Promise<ResponseWrapper<NotificationResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<NotificationResponse>>(
            `/notification/${notificationId}/read`,
        );
        return res.data;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<ResponseWrapper<void>> => {
        const res = await apiClient.patch<ResponseWrapper<void>>('/notification/read-all');
        return res.data;
    },

    
    /**
     * Delete a specific notification
     * @param notificationId
     */
    deleteById: async (notificationId: string): Promise<void> => {
        await apiClient.delete(`/notification/${notificationId}`);
    },

    /**
     * Delete all notifications
     */
    deleteAll: async (): Promise<void> => {
        await apiClient.delete('/notification/all');
    },
};