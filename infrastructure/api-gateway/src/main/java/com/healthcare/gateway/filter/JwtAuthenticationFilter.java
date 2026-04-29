package com.healthcare.gateway.filter;

import com.healthcare.gateway.enums.ErrorCode;
import com.healthcare.gateway.exception.AuthException;
import com.healthcare.gateway.exception.JwtAuthenticationException;
import com.healthcare.gateway.security.JwtService;
import com.healthcare.gateway.security.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";

    private static final String X_USER_ID = "X-User-Id";
    private static final String X_USER_ROLE = "X-User-Role";

    private final JwtService jwtService;
    private final TokenBlacklistService blacklistService;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register/patient", "/api/auth/register/doctor", "/api/auth/refresh", "/api/auth/login",
            "/api/doctor/search", "/api/doctor/*/public",
            "/actuator/health", "/actuator/info"
    );

    private static final List<String> PUBLIC_PREFIXES = List.of("/v3/api-docs", "/swagger-ui");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();

        /*
         * These endpoints are meant for internal communication between services and may
         * expose sensitive operations or data.
         * By enforcing a strict 403 response for any request containing "/internal/",
         * we ensure that even if an attacker discovers these endpoints, they cannot
         * access them from outside the trusted network.
         */
        if (path.contains("/internal/")) {
            log.warn("Blocked external attempt to access internal path: {}", path);
            return Mono.error(new AuthException(ErrorCode.ACCESS_DENIED,
                    "Access to internal endpoints is not allowed"));
        }

        // Allow public paths through without authentication
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Extract Authorization header and validate format
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return Mono.error(new AuthException(ErrorCode.INVALID_AUTH_HEADER));
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        Claims claims;
        try {
            claims = jwtService.extractAllClaims(token);
        } catch (JwtAuthenticationException ex) {
            log.warn("JWT validation failed - code: {}, path: {}", ex.getErrorCode(), path);
            return Mono.error(ex);
        } catch (Exception ex) {
            log.error("Unexpected error during JWT parsing, path: {}", path, ex);
            return Mono.error(new JwtAuthenticationException(ErrorCode.TOKEN_INVALID));
        }

        // Pull all values from the single cached Claims object
        String jti = claims.getId();
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);

        // Validate required claims are present
        if (!StringUtils.hasText(jti) || !StringUtils.hasText(userId) || !StringUtils.hasText(role)) {
            log.warn("JWT is missing required claims — path: {}", path);
            return Mono.error(new JwtAuthenticationException(ErrorCode.TOKEN_MISSING_CLAIM));
        }

        // Check Redis blacklist — handles logged-out tokens
        return blacklistService.isBlacklisted(jti)
                .flatMap(isBlacklisted -> {
                    if (Boolean.TRUE.equals(isBlacklisted)) {
                        log.warn("Blacklisted token used — jti: {}, path: {}", jti, path);
                        return Mono.error(new JwtAuthenticationException(
                                ErrorCode.TOKEN_INVALID,
                                "Token has been invalidated. Please log in again."
                        ));
                    }

                    /*
                     * Strip spoofable headers then inject verified values from JWT claims.
                     * A malicious client could manually set X-User-* headers to impersonate another
                     * user or escalate privileges. By removing any existing X-User-* headers and replacing them with values
                     * derived solely from the validated JWT, we eliminate this attack vector.
                     */
                    ServerWebExchange mutatedExchange = exchange.mutate()
                            .request(r -> r
                                    .headers(headers -> {
                                        headers.remove(X_USER_ID);
                                        headers.remove(X_USER_ROLE);
                                    })
                                    .headers(headers -> {
                                        headers.add(X_USER_ID, userId);
                                        headers.add(X_USER_ROLE, role);
                                    })
                            )
                            .build();

                    log.debug("Request authorized — userId: {}, role: {}, path: {}",
                            userId, role, path);
                    return chain.filter(mutatedExchange);
                });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private boolean isPublicPath(String path) {
        boolean exactMatch = PUBLIC_PATHS.stream().anyMatch(path::equals);
        boolean prefixMatch = PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);

        // Handle wildcard patterns like /api/doctor/*/search
        boolean wildcardMatch = PUBLIC_PATHS.stream()
                .filter(p -> p.contains("*"))
                .anyMatch(pattern -> {
                    // Convert pattern to regex: replace * with [^/]+
                    String regex = pattern.replace("/", "\\/").replace("*", "[^\\/]+");
                    return path.matches(regex);
                });

        return exactMatch || prefixMatch || wildcardMatch;
    }
}