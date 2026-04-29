package com.healthcare.appointment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Authentication
    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    // Slot
    SLOT_NOT_AVAILABLE(ErrorType.NOT_FOUND, "The requested slot is not available"),
    INVALID_SLOT_DATE(ErrorType.VALIDATION, "The selected slot date is not valid"),

    // Appointment
    APPOINTMENT_NOT_FOUND(ErrorType.NOT_FOUND, "The appointment associated with the provided credentials was not found"),
    APPOINTMENT_NOT_CANCELLABLE(ErrorType.BUSINESS, "The appointment cannot be cancelled"),
    APPOINTMENT_ALREADY_CANCELLED(ErrorType.BUSINESS, "The appointment has already been cancelled"),
    INVALID_APPOINTMENT_STATUS(ErrorType.BUSINESS, "The appointment is not in the required state for this operation"),

    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later");

    private final ErrorType type;
    private final String defaultMessage;
}