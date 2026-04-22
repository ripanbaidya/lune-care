package com.healthcare.auth.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    INVALID_CREDENTIALS(ErrorType.AUTHENTICATION, "The provided email or password is incorrect"),
    INVALID_AUTH_HEADER(ErrorType.AUTHENTICATION, "Invalid or missing Authorization header"),
    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),
    ACCOUNT_SUSPENDED(ErrorType.AUTHORIZATION, "This account has been suspended and cannot be used to log in, please contact to support!"),



    // JWT
    TOKEN_EXPIRED(ErrorType.AUTHENTICATION, "The authentication token has expired"),
    TOKEN_INVALID(ErrorType.AUTHENTICATION, "The authentication token is invalid or malformed"),
    TOKEN_MISSING_CLAIM(ErrorType.AUTHENTICATION, "The authentication token is missing a required claim"),
    TOKEN_SIGNATURE_INVALID(ErrorType.AUTHENTICATION, "Token signature verification failed"),
    TOKEN_UNSUPPORTED(ErrorType.AUTHENTICATION, "The provided token format is not supported"),

    // Refresh Token
    REFRESH_TOKEN_NOT_FOUND(ErrorType.AUTHENTICATION, "The refresh token was not found"),
    REFRESH_TOKEN_EXPIRED(ErrorType.AUTHENTICATION, "The refresh token has expired"),
    REFRESH_TOKEN_REVOKED(ErrorType.AUTHENTICATION, "The refresh token has been revoked and cannot be used"),

    // Key Loading / Security Infrastructure
    KEY_FILE_NOT_FOUND(ErrorType.INTERNAL, "The key file could not be found"),
    KEY_FILE_NOT_READABLE(ErrorType.INTERNAL, "The key file exists but cannot be read"),
    KEY_FILE_READ_FAILED(ErrorType.INTERNAL, "Failed to read the key file"),
    INVALID_KEY_FORMAT(ErrorType.INTERNAL, "The key file format or encoding is invalid"),
    PRIVATE_KEY_LOAD_FAILED(ErrorType.INTERNAL, "Failed to load the private key"),
    PUBLIC_KEY_LOAD_FAILED(ErrorType.INTERNAL, "Failed to load the public key"),

    USER_NOT_FOUND(ErrorType.NOT_FOUND, "The user associated with the provided credentials was not found"),
    USER_ALREADY_EXISTS(ErrorType.CONFLICT, "A user with the provided phone number already exists"),

    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later");

    private final ErrorType type;
    private final String defaultMessage;
}