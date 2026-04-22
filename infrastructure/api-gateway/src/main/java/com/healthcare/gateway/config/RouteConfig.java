package com.healthcare.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // auth-service
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://auth")
                )
                .route("auth-service-user", r -> r
                        .path("/api/user/**")
                        .uri("lb://auth")
                )

                // patient-service
                .route("patient", r -> r
                        .path("/api/patient/**")
                        .uri("lb://patient")
                )

                // doctor-service
                .route("doctor", r -> r
                        .path("/api/doctor/**")
                        .uri("lb://doctor")
                )

                .build();
    }
}
