package com.healthcare.admin.exception.handler;

import com.healthcare.admin.enums.ErrorCode;
import com.healthcare.admin.exception.BusinessException;
import com.healthcare.admin.payload.dto.error.ErrorDetail;
import com.healthcare.admin.payload.dto.error.ErrorResponse;
import com.healthcare.admin.payload.dto.error.FieldError;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BusinessException ex,
                                                             HttpServletRequest request) {

        log.warn("Base exception: [{}] - {}", ex.getErrorCode(), ex.getResolvedMessage());

        var errorResponse = ErrorResponse.of(ErrorDetail.builder()
                .code(ex.getErrorCode())
                .path(request.getRequestURI())
                .build()
        );

        return ResponseEntity.status(ex.getErrorCode().getType().getStatusCode())
                .body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex,
                                                                   HttpServletRequest request) {

        // Extract field validation errors
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> new FieldError(error.getField(), error.getDefaultMessage()))
                .toList();

        // Build API error response with field-level details
        var errorResponse = ErrorResponse.of(ErrorDetail.builder()
                .code(ErrorCode.VALIDATION_FAILED)
                .path(request.getRequestURI())
                .errors(fieldErrors)
                .build());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex,
                                                          HttpServletRequest request) {

        log.error("Unhandled exception at {}", request.getRequestURI(), ex);

        var response = ErrorResponse.of(ErrorDetail.builder()
                .code(ErrorCode.INTERNAL_ERROR)
                .path(request.getRequestURI())
                .build()
        );

        return ResponseEntity.internalServerError().body(response);
    }
}
