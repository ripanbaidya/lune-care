package com.healthcare.notification.enums;

public enum NotificationType {
 
    APPOINTMENT_CONFIRMED,
    APPOINTMENT_CANCELLED,
    APPOINTMENT_COMPLETED,
    APPOINTMENT_NO_SHOW,
    APPOINTMENT_PAYMENT_FAILED,

    // TODO: Add more notification types as business requirement grows

    // Payment
    // PAYMENT_REFUND_PROCESSED,
    // PAYMENT_REFUND_FAILED,
 
    // Feedback
    // FEEDBACK_RECEIVED,
 
    // Admin
    // DOCTOR_VERIFIED,
    // DOCTOR_REJECTED,
}