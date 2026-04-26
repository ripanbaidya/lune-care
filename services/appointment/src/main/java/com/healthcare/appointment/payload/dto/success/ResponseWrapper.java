package com.healthcare.appointment.payload.dto.success;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.springframework.http.HttpStatus;

import java.time.Instant;


@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder(value = {"success", "status", "message", "data", "timestamp"})
public record ResponseWrapper<T>(
    boolean success,
    int status,
    String message,
    T data,
    Instant timestamp
) {

    public static <T> ResponseWrapper<T> ok(String message) {
        return new ResponseWrapper<>(true, HttpStatus.OK.value(), message, null, Instant.now());
    }

    public static <T> ResponseWrapper<T> ok(String message, T data) {
        return new ResponseWrapper<>(true, HttpStatus.OK.value(), message, data, Instant.now());
    }

    public static <T> ResponseWrapper<T> created(String message, T data) {
        return new ResponseWrapper<>(true, HttpStatus.CREATED.value(), message, data, Instant.now());
    }

    public static <T> ResponseWrapper<T> accepted(String message, T data) {
        return new ResponseWrapper<>(true, HttpStatus.ACCEPTED.value(), message, data, Instant.now());
    }

    public static <T> ResponseWrapper<T> of(HttpStatus httpStatus, String message, T data) {
        return new ResponseWrapper<>(true, httpStatus.value(), message, data, Instant.now());
    }
}