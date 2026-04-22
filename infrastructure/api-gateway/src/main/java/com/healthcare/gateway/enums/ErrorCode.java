package com.healthcare.gateway.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    INVALID_AUTH_HEADER(ErrorType.AUTHENTICATION, "Invalid or missing Authorization header"),
    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    // JWT
    TOKEN_EXPIRED(ErrorType.AUTHENTICATION, "The authentication token has expired"),
    TOKEN_INVALID(ErrorType.AUTHENTICATION, "The authentication token is invalid or malformed"),
    TOKEN_MISSING_CLAIM(ErrorType.AUTHENTICATION, "The authentication token is missing a required claim"),
    TOKEN_SIGNATURE_INVALID(ErrorType.AUTHENTICATION, "Token signature verification failed"),
    TOKEN_UNSUPPORTED(ErrorType.AUTHENTICATION, "The provided token format is not supported"),

    // Key Loading / Security Infrastructure
    KEY_FILE_NOT_FOUND(ErrorType.INTERNAL, "The key file could not be found"),
    KEY_FILE_NOT_READABLE(ErrorType.INTERNAL, "The key file exists but cannot be read"),
    KEY_FILE_READ_FAILED(ErrorType.INTERNAL, "Failed to read the key file"),
    INVALID_KEY_FORMAT(ErrorType.INTERNAL, "The key file format or encoding is invalid"),
    PRIVATE_KEY_LOAD_FAILED(ErrorType.INTERNAL, "Failed to load the private key"),
    PUBLIC_KEY_LOAD_FAILED(ErrorType.INTERNAL, "Failed to load the public key"),

    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later");

    private final ErrorType type;
    private final String defaultMessage;
}