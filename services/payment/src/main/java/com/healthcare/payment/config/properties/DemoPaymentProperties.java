package com.healthcare.payment.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment.demo")
public record DemoPaymentProperties(
        boolean enabled
) {
}
