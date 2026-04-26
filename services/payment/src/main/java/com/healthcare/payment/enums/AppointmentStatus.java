package com.healthcare.payment.enums;

public enum AppointmentStatus {

    /**
     * Slot is locked, waiting for payment
     */
    PENDING_PAYMENT,

    /**
     * Payment done, appointment confirmed
     */
    CONFIRMED,

    /**
     * Appointment completed, doctor marked complete
     */
    COMPLETED,

    /**
     * Cancellation - done by patient/doctor/system (SAGA compensation)
     */
    CANCELLED,

    /**
     * Patient didn't arrive
     */
    NO_SHOW,

    /**
     * Cancellation - refund initiated
     */
    REFUND_INITIATED
}