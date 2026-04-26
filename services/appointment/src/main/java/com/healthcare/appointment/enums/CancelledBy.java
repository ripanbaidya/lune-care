package com.healthcare.appointment.enums;

public enum CancelledBy {

    /**
     * Payment canceled by patient
     */
    PATIENT,

    /**
     * Payment canceled by doctor
     */
    DOCTOR,

    /**
     * Payment canceled by system (timeout or payment failure)
     */
    SYSTEM
}