package com.healthcare.auth.enums;

public enum AccountStatus {

    /**
     * Default status for all account
     */
    INACTIVE,

    /**
     * Account is active and fully operational. for the patients - Active after registration.
     * and for doctors - Active after document verified by admin.
     */
    ACTIVE,

    /**
     * Doctor is in the onboarding process after registration.
     */
    ONBOARDING,

    /**
     * Doctor has submitted documents awaiting admin verification.
     */
    PENDING_VERIFICATION,

    /**
     * Account has been suspended by admin.
     */
    SUSPENDED
}