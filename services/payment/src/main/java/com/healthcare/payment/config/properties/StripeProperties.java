package com.healthcare.payment.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment.gateway.stripe")
public record StripeProperties(
        boolean enabled,
        String secretKey,
        String webhookSecret
) {
}