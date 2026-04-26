package com.healthcare.payment.enums;

public enum PaymentStatus {

    /**
     * Order created, awaiting payment
     */
    INITIATED,

    /**
     * Payment done, appointment confirmed
     */
    SUCCESS,

    /**
     * Signature verification failed or payment failed
     */
    FAILED,

    /**
     * Refund processed successfully
     */
    REFUNDED,

    /**
     * Refund attempt failed
     */
    REFUND_FAILED
}