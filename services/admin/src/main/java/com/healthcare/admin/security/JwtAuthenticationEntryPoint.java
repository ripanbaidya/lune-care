package com.healthcare.admin.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.admin.payload.dto.error.ErrorDetail;
import com.healthcare.admin.payload.dto.error.ErrorResponse;
import com.healthcare.admin.enums.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        log.warn("Unauthorized access attempt to {} from {} - Reason: {}",
                request.getRequestURI(), request.getRemoteAddr(), authException.getMessage());

        var errorResponse = ErrorResponse.of(ErrorDetail.builder()
                .code(ErrorCode.UNAUTHENTICATED)
                .path(request.getRequestURI())
                .build());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
