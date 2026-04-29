package com.healthcare.appointment.exception.handler;

import com.healthcare.appointment.enums.ErrorCode;
import com.healthcare.appointment.exception.BaseException;
import com.healthcare.appointment.payload.dto.error.ErrorDetail;
import com.healthcare.appointment.payload.dto.error.ErrorResponse;
import com.healthcare.appointment.payload.dto.error.FieldError;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles all domain exceptions ({@link BaseException} subclasses).
     */
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex,
                                                             HttpServletRequest request) {
        log.warn("Domain exception: [{}] {}", ex.getErrorCode(), ex.getResolvedMessage());

        var errorResponse = ErrorResponse.of(ErrorDetail.builder()
                .code(ex.getErrorCode())
                .message(ex.getResolvedMessage())
                .path(request.getRequestURI())
                .build()
        );

        return ResponseEntity.status(ex.getErrorCode().getType().getStatusCode())
                .body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex,
                                                                   HttpServletRequest request) {
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> new FieldError(error.getField(), error.getDefaultMessage()))
                .toList();

        var errorResponse = ErrorResponse.of(ErrorDetail.builder()
                .code(ErrorCode.VALIDATION_FAILED)
                .path(request.getRequestURI())
                .errors(fieldErrors)
                .build());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(DataAccessException ex,
                                                          HttpServletRequest request) {
        String rootCause = ex.getMostSpecificCause().getMessage();
        log.error("Data access failure at {}: {}", request.getRequestURI(), rootCause, ex);

        var response = ErrorResponse.of(ErrorDetail.builder()
                .code(ErrorCode.INTERNAL_ERROR)
                .message(rootCause)
                .path(request.getRequestURI())
                .build()
        );

        return ResponseEntity.internalServerError().body(response);
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