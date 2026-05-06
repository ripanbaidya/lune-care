package com.healthcare.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.http.HttpMethod.*;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        config.setAllowedMethods(
                List.of(GET.name(), POST.name(), PUT.name(), PATCH.name(), DELETE.name(), OPTIONS.name())
        );

        // Headers the browser is allowed to SEND
        config.setAllowedHeaders(List.of(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE,
                "X-Requested-With"
        ));

        // Headers the browser JS is allowed to READ from responses
        // X-User-Id and X-User-Role are NOT here — they're internal gateway→service headers only
        config.setExposedHeaders(List.of(
                "X-RateLimit-Remaining",
                "X-RateLimit-Replenish-Rate",
                "X-RateLimit-Burst-Capacity"
        ));

        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}