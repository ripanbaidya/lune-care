package com.healthcare.gateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
public class GatewayCodecConfig implements WebFluxConfigurer {

    // Increase codec limits so multipart file data is not truncated
    // or rejected before it reaches the downstream service
    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024); // 10MB
    }
}
