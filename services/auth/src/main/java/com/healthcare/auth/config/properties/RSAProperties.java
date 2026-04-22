package com.healthcare.auth.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.rsa")
public record RSAProperties(
        String algorithm,
        String privateKeyPath,
        String publicKeyPath
) {
}
