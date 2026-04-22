package com.healthcare.gateway.exception.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.gateway.enums.ErrorCode;
import com.healthcare.gateway.exception.BaseException;
import com.healthcare.gateway.exception.JwtAuthenticationException;
import com.healthcare.gateway.exception.KeyLoadException;
import com.healthcare.gateway.payload.dto.error.ErrorDetail;
import com.healthcare.gateway.payload.dto.error.ErrorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@Order(-1)
@RequiredArgsConstructor
public class GatewayExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        String path = exchange.getRequest().getPath().toString();

        ErrorResponse errorResponse = resolveErrorResponse(ex, path);
        int statusCode = resolveStatusCode(ex);

        return writeResponse(exchange, errorResponse, statusCode);
    }

    private ErrorResponse resolveErrorResponse(Throwable ex, String path) {

        if (ex instanceof JwtAuthenticationException jwtEx) {
            log.warn("JWT authentication failure — code: [{}], path: {}", jwtEx.getErrorCode(), path);
            return ErrorResponse.of(ErrorDetail.builder()
                    .code(jwtEx.getErrorCode())
                    .message(jwtEx.getResolvedMessage())
                    .path(path)
                    .build()
            );
        }

        if (ex instanceof KeyLoadException keyEx) {
            log.error("Key infrastructure failure — code: [{}], message: {}", keyEx.getErrorCode(),
                    keyEx.getResolvedMessage(), keyEx);
            return ErrorResponse.of(ErrorDetail.builder()
                    .code(ErrorCode.INTERNAL_ERROR)
                    .path(path)
                    .build()
            );
        }

        if (ex instanceof BaseException baseEx) {
            log.warn("Gateway base exception — code: [{}], message: {}, path: {}", baseEx.getErrorCode(),
                    baseEx.getResolvedMessage(), path);
            return ErrorResponse.of(ErrorDetail.builder()
                    .code(baseEx.getErrorCode())
                    .message(baseEx.getResolvedMessage())
                    .path(path)
                    .build()
            );
        }

        // ResponseStatusException — Spring internal exceptions
        if (ex instanceof ResponseStatusException rse) {
            ErrorCode errorCode = mapHttpStatusToErrorCode(rse.getStatusCode().value());
            String message = rse.getReason() != null
                    ? rse.getReason()
                    : errorCode.getDefaultMessage();

            log.warn("Spring ResponseStatusException — status: {}, path: {}", rse.getStatusCode().value(), path);
            return ErrorResponse.of(ErrorDetail.builder()
                    .code(errorCode)
                    .message(message)
                    .path(path)
                    .build()
            );
        }

        log.error("Unhandled gateway exception at path: {}", path, ex);
        return ErrorResponse.of(ErrorDetail.builder()
                .code(ErrorCode.INTERNAL_ERROR)
                .path(path)
                .build()
        );
    }

    private int resolveStatusCode(Throwable ex) {

        if (ex instanceof KeyLoadException) {
            return HttpStatus.INTERNAL_SERVER_ERROR.value();
        }

        if (ex instanceof BaseException baseEx) {
            return baseEx.getErrorCode().getType().getStatusCode();
        }

        if (ex instanceof ResponseStatusException rse) {
            return rse.getStatusCode().value();
        }

        return HttpStatus.INTERNAL_SERVER_ERROR.value();
    }

    // Writes serialized ErrorResponse bytes into the reactive response
    private Mono<Void> writeResponse(ServerWebExchange exchange, ErrorResponse errorResponse, int statusCode) {
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);

            exchange.getResponse().setStatusCode(HttpStatus.valueOf(statusCode));
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            DataBuffer buffer = exchange.getResponse()
                    .bufferFactory()
                    .wrap(bytes);

            return exchange.getResponse().writeWith(Mono.just(buffer));

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize ErrorResponse", e);
            byte[] fallback = """
                    {
                        "success": false,
                         "error": {
                            "message": "Gateway error"
                         }
                    }
                    """.getBytes();
            DataBuffer buffer = exchange.getResponse()
                    .bufferFactory()
                    .wrap(fallback);
            exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        }
    }

    private ErrorCode mapHttpStatusToErrorCode(int status) {
        return switch (status) {
            case 400 -> ErrorCode.VALIDATION_FAILED;
            case 401 -> ErrorCode.UNAUTHENTICATED;
            case 403 -> ErrorCode.ACCESS_DENIED;
            case 503 -> ErrorCode.SERVICE_UNAVAILABLE;
            default -> ErrorCode.INTERNAL_ERROR;
        };
    }
}