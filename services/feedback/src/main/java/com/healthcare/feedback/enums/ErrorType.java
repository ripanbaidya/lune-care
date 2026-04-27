package com.healthcare.feedback.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorType {

    VALIDATION("Validation Failed", HttpStatus.BAD_REQUEST.value()), // 400
    AUTHENTICATION("Authentication Required or Invalid", HttpStatus.UNAUTHORIZED.value()), // 401
    AUTHORIZATION("Access Denied", HttpStatus.FORBIDDEN.value()), // 403
    NOT_FOUND("Resource Not Found", HttpStatus.NOT_FOUND.value()), // 404
    CONFLICT("Resource Conflict", HttpStatus.CONFLICT.value()), // 409
    BUSINESS("Business Rule Violation", HttpStatus.UNPROCESSABLE_ENTITY.value()), // 422
    INTERNAL("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR.value()), // 500
    SERVICE_UNAVAILABLE("Service Temporarily Unavailable", HttpStatus.SERVICE_UNAVAILABLE.value()); // 503

    private final String title;
    private final int statusCode;
}