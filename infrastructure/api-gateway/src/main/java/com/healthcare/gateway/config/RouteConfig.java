package com.healthcare.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class RouteConfig {

    private final RateLimiterConfig rateLimiterConfig;

    public RouteConfig(RateLimiterConfig rateLimiterConfig) {
        this.rateLimiterConfig = rateLimiterConfig;
    }

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // auth-service - higher limit, public routes (login/ register)
                // IP-Based because X-User-Id header is not set yet
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(authRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.ipKeyResolver());
                                })
                        )
                        .uri("lb://auth")
                )
                .route("auth-service-user", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(standardRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://auth")
                )

                // patient-service: standard and userId based
                .route("patient", r -> r
                        .path("/api/patient/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(standardRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://patient")
                )

                // doctor-service
                .route("doctor", r -> r
                        .path("/api/doctor/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(standardRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://doctor")
                )

                // appointment-service
                .route("appointment-service", r -> r
                        .path("/api/appointment/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(standardRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://appointment")
                )

                // payment-service
                .route("payment-service", r -> r
                        .path("/api/payment/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(paymentRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://payment")
                )

                // notification-service
                .route("notification-service", r -> r
                        .path("/api/notification/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(standardRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://notification")
                )

                .route("feedback-service", r -> r
                        .path("/api/feedback/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(standardRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://feedback")
                )

                .route("admin-service", r -> r
                        .path("/api/admin/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(adminRateLimiter());
                                    c.setKeyResolver(rateLimiterConfig.userIdKeyResolve());
                                })
                        )
                        .uri("lb://admin")
                )

                .build();
    }

    // RedisRateLimiter instances - (replenishRate, burstCapacity, requestedTokens)
    // replenishRate: sustained requests per second per key
    // burstCapacity: max requests allowed in a spike (token bucket ceiling)
    // requestedTokens: tokens consumed per request (always 1 here)

    /**
     * Public auth routes - login, register
     * Higher limit since these are entry points and may have legitimate traffic.
     */
    @Bean
    public RedisRateLimiter authRateLimiter() {
        return new RedisRateLimiter(30, 60, 1);
    }

    /**
     * Standard routes for most authenticated service routes.
     */
    @Bean
    @Primary
    public RedisRateLimiter standardRateLimiter() {
        return new RedisRateLimiter(20, 40, 1);
    }

    /**
     * Stricter limit for payment routes.
     * A lower ceiling prevents abuse of payment initiation endpoints.
     */
    @Bean
    public RedisRateLimiter paymentRateLimiter() {
        return new RedisRateLimiter(10, 20, 1);
    }

    /**
     * Strictest limit for admin routes.
     * Admin operations are intentionally low-frequency.
     */
    @Bean
    public RedisRateLimiter adminRateLimiter() {
        return new RedisRateLimiter(5, 10, 1);
    }
}
