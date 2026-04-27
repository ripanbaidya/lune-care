package com.healthcare.feedback.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.feedback.enums.ErrorCode;
import com.healthcare.feedback.payload.dto.error.ErrorDetail;
import com.healthcare.feedback.payload.dto.error.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        log.warn("Access denied to {} for user from {} - Reason: {}",
            request.getRequestURI(), request.getRemoteAddr(), accessDeniedException.getMessage());

        var errorResponse = ErrorResponse.of(ErrorDetail.builder()
            .code(ErrorCode.ACCESS_DENIED)
            .path(request.getRequestURI())
            .build());

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}