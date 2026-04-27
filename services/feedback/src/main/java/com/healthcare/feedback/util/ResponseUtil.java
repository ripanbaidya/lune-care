package com.healthcare.feedback.util;

import com.healthcare.feedback.payload.dto.success.PageInfo;
import com.healthcare.feedback.payload.dto.success.ResponseWrapper;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

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

    public static <T> ResponseEntity<ResponseWrapper<Map<String, Object>>> paginated(
        String message, Page<T> page
    ) {
        Map<String, Object> data = Map.of(
                "content", page.getContent(),
                "page", PageInfo.from(page)
        );

        return ResponseEntity.ok(ResponseWrapper.ok(message, data));
    }

    public static <T> ResponseEntity<ResponseWrapper<Map<String, Object>>> paginatedWithFilters(
            String message, Page<T> page, Map<String, Object> filters
    ) {
        Map<String, Object> data = Map.of(
                "content", page.getContent(),
                "page", PageInfo.from(page),
                "filters", filters
        );
        return ResponseEntity.ok(ResponseWrapper.ok(message, data));
    }
}
