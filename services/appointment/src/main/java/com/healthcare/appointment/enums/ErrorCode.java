package com.healthcare.appointment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    /*
     * SLOT
     */
    SLOT_NOT_AVAILABLE(ErrorType.NOT_FOUND, "The requested slot is not available"),

    APPOINTMENT_NOT_FOUND(ErrorType.NOT_FOUND, "The appointment associated with the provided credentials was not found"),
    APPOINTMENT_NOT_CACELLABLE(ErrorType.VALIDATION, "The appointment cannot be cancelled"),
    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later"),
    INVALID_SLOT_DATE(ErrorType.VALIDATION, "The selected slot date is not valid" );

    private final ErrorType type;
    private final String defaultMessage;
}