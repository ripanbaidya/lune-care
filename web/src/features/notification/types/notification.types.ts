export type NotificationCategory = 'APPOINTMENT' | 'PAYMENT' | 'FEEDBACK' | 'SYSTEM';

export type NotificationType =
    | 'APPOINTMENT_CONFIRMED'
    | 'APPOINTMENT_CANCELLED'
    | 'APPOINTMENT_COMPLETED'
    | 'APPOINTMENT_NO_SHOW'
    | 'APPOINTMENT_PAYMENT_FAILED';

export interface NotificationResponse {
    id: string;
    recipientId: string;
    recipientRole: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    body: string;
    referenceId: string;       // appointmentId — use for deep-linking
    isRead: boolean;
    createdAt: string;         // ISO instant string
}

export interface NotificationPage {
    content: NotificationResponse[];
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

// Maps for display
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    APPOINTMENT_CONFIRMED: 'Appointment Confirmed',
    APPOINTMENT_CANCELLED: 'Appointment Cancelled',
    APPOINTMENT_COMPLETED: 'Appointment Completed',
    APPOINTMENT_NO_SHOW: 'Missed Appointment',
    APPOINTMENT_PAYMENT_FAILED: 'Payment Window Expired',
};

export const NOTIFICATION_CATEGORY_ICON: Record<NotificationCategory, string> = {
    APPOINTMENT: '📅',
    PAYMENT: '💳',
    FEEDBACK: '⭐',
    SYSTEM: '🔔',
};