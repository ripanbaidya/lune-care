package com.healthcare.admin.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    PATIENT_NOT_FOUND(ErrorType.NOT_FOUND, "The patient associated with the provided credentials was not found"),
    PATIENT_ALREADY_EXISTS(ErrorType.CONFLICT, "A patient with the provided phone number already exists"),
    PATIENT_PROFILE_PHOTO_NOT_FOUND(ErrorType.NOT_FOUND, "The patient's profile photo was not found"),

    PHOTO_UPLOAD_FAILED(ErrorType.INTERNAL, "Failed to upload the photo. Please try again later"),

    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred");

    private final ErrorType type;
    private final String defaultMessage;
}