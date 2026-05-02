package com.healthcare.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Configuration
public class RateLimiterConfig {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String ANONYMOUS_PREFIX = "anon:";

    /**
     * Resolves a Rate Limit key by authenticated userId (injected by JwtAuthencticationfilter).
     * Fallback to client IP for authenticated requests.
     * Using userId over IP:
     * - Prevents one user from consuming another's quota behind shared NAT
     * - More accurate per-user throttling
     * - Aligns with how your JWT filter already injects X-User-Id
     */
    @Bean
    public KeyResolver userIdKeyResolve() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders()
                    .getFirst(HEADER_USER_ID);

            if (userId != null && !userId.isBlank()) {
                return Mono.just("user:" + userId);
            }

            // Fallback to IP for public unauthenticated routes
            return Mono.just(ANONYMOUS_PREFIX + resolveClientIp(exchange.getRequest()));
        };
    }

    /**
     * IP-only resolver: used for public auth routes (login, register).
     * These routes don't have {@code X-User-Id} header yet since user isn't authenticated.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return  exchange -> Mono.just(ANONYMOUS_PREFIX + resolveClientIp(exchange.getRequest()));
    }

    /**
     * Resolves client IP respecting X-Forwarded-For for reverse proxy setups.
     */
    private String resolveClientIp(ServerHttpRequest request) {
        String forwarded = request.getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // X-Forwarded-For can contain chain: "client, proxy1, proxy2"
            return forwarded.split(",")[0].trim();
        }

        return Objects.requireNonNull(request.getRemoteAddress())
                .getAddress().getHostAddress();
    }


}
