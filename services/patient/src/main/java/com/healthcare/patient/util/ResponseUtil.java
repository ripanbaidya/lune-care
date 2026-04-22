package com.healthcare.patient.util;

import com.healthcare.patient.payload.dto.success.ResponseWrapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public final class ResponseUtil {

    private ResponseUtil() {
    }

    public static <T> ResponseEntity<ResponseWrapper<T>> ok(String message) {
        return ResponseEntity.ok(ResponseWrapper.ok(message));
    }

    public static <T> ResponseEntity<ResponseWrapper<T>> ok(String message, T data) {
        return ResponseEntity.ok(ResponseWrapper.ok(message, data));
    }

    public static <T> ResponseEntity<ResponseWrapper<T>> created(String message, T data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseWrapper.created(message, data));
    }

    public static <T> ResponseEntity<ResponseWrapper<T>> accepted(String message, T data) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ResponseWrapper.accepted(message, data));
    }

    public static ResponseEntity<Void> noContent() {
        return ResponseEntity.noContent().build();
    }
}
