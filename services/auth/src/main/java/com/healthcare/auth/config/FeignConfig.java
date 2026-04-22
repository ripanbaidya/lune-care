package com.healthcare.auth.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.DownstreamServiceException;
import feign.Response;
import feign.RetryableException;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
public class FeignConfig {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            String downstreamPath = response.request().url();
            int status = response.status();
            String rawBody = extractBody(response);

            log.error("Feign call failed — method: {}, url: {}, status: {}, body: {}", methodKey,
                    downstreamPath, status, rawBody);

            /*
             * Try to parse the downstream ErrorResponse body.
             * If parsing succeeds, use the message from downstream for precision.
             * If it fails (downstream returned HTML or unexpected format), fall back to defaults.
             */
            String downstreamMessage = extractMessageFromBody(rawBody);

            return switch (status) {
                case 400 -> new DownstreamServiceException(
                        ErrorCode.VALIDATION_FAILED,
                        downstreamMessage != null ? downstreamMessage : "Request validation failed at downstream service"
                );
                case 401 -> new DownstreamServiceException(
                        ErrorCode.UNAUTHENTICATED,
                        downstreamMessage != null ? downstreamMessage : "Authentication required"
                );
                case 403 -> new DownstreamServiceException(
                        ErrorCode.ACCESS_DENIED,
                        downstreamMessage != null ? downstreamMessage : "Access denied"
                );
                case 404 -> new DownstreamServiceException(
                        ErrorCode.INTERNAL_ERROR,
                        downstreamMessage != null ? downstreamMessage : "Requested resource not found"
                );
                case 409 -> new DownstreamServiceException(
                        ErrorCode.USER_ALREADY_EXISTS,
                        downstreamMessage != null ? downstreamMessage : "User already exists"
                );
                case 503 -> new RetryableException(
                        status,
                        ErrorCode.SERVICE_UNAVAILABLE.getDefaultMessage(),
                        response.request().httpMethod(),
                        (Long) null,
                        response.request()
                );
                default -> new DownstreamServiceException(
                        ErrorCode.INTERNAL_ERROR,
                        downstreamMessage != null ? downstreamMessage : "Internal server error at downstream service"
                );
            };
        };
    }

    /**
     * Reads the response body as a UTF-8 string.
     *
     * @param response the response object from Feign
     * @return body if present, or empty string
     */

    private String extractBody(Response response) {
        try {
            if (response.body() == null)
                return "";

            return new String(
                    response.body().asInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );
        } catch (IOException e) {
            log.warn("Could not read Feign error response body", e);
            return "";
        }
    }

    /**
     * Navigates the ErrorResponse JSON structure:
     * <pre>
     * {
     *   "success": false,
     *    "error": {
     *      "message": "..."
     *     }
     * }
     * </pre>
     *
     * @return null if the body is not in the expected format
     */
    private String extractMessageFromBody(String body) {
        if (body == null || body.isBlank())
            return null;
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode errorNode = root.path("error");
            if (!errorNode.isMissingNode()) {
                JsonNode messageNode = errorNode.path("message");
                if (!messageNode.isMissingNode()) {
                    return messageNode.asText();
                }
            }
        } catch (IOException e) {
            log.warn("Could not parse downstream error body as ErrorResponse JSON: {}", body);
        }
        return null;
    }
}
