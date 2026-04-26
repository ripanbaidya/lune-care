package com.healthcare.patient.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.integration.cloudinary")
public record CloudinaryProperties(
        boolean enabled,
        String cloudName,
        String apiKey,
        String apiSecret
) {
}
