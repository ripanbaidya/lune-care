package com.healthcare.payment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    PAYMENT_NOT_FOUND(ErrorType.NOT_FOUND, "Payment record not found"),
    PAYMENT_ALREADY_EXISTS(ErrorType.CONFLICT, "Payment already initiated for this appointment"),
    PAYMENT_VERIFICATION_FAILED(ErrorType.BUSINESS, "Payment signature verification failed"),
    PAYMENT_ALREADY_COMPLETED(ErrorType.CONFLICT, "Payment has already been completed"),
    REFUND_NOT_APPLICABLE(ErrorType.BUSINESS, "Refund is not applicable for this payment"),
    REFUND_FAILED(ErrorType.INTERNAL, "Refund processing failed"),
    RAZORPAY_ORDER_CREATION_FAILED(ErrorType.INTERNAL, "Failed to create Razorpay order"),

    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later");

    private final ErrorType type;
    private final String defaultMessage;
}