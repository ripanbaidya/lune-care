package com.healthcare.auth.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.auth.password-reset")
public record PasswordResetProperties(
        Duration tokenTtl
) {
}
