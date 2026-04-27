package com.healthcare.feedback.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    FEEDBACK_NOT_FOUND(ErrorType.NOT_FOUND, "Feedback not found"),
    FEEDBACK_ALREADY_EXISTS(ErrorType.CONFLICT, "You have already submitted feedback for this appointment"),
    FEEDBACK_NOT_ELIGIBLE(ErrorType.BUSINESS, "You are not eligible to submit feedback for this appointment"),
    FEEDBACK_UNAUTHORIZED(ErrorType.AUTHORIZATION, "You are not authorized to modify this feedback"),

    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later");

    private final ErrorType type;
    private final String defaultMessage;
}