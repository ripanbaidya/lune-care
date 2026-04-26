package com.healthcare.appointment.enums;

public enum SlotStatus {

    /**
     * Default status for all slots, It can be either available, locked or booked.
     */
    AVAILABLE,

    /**
     * Redis lock acquired, payment pending
     */
    LOCKED,

    /**
     * Payment confirmed, appointment active
     */
    BOOKED,

    /**
     * Soft canceled, appointment canceled
     */
    CANCELLED
}