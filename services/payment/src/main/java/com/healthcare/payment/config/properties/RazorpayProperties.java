package com.healthcare.payment.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment.gateway.razorpay")
public record RazorpayProperties (
        boolean enabled,
        String keyId,
        String keySecret
) {
}
