package com.healthcare.patient.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class CloudinaryConfig {

    @Value("${app.integrations.cloudinary.enabled}")
    private boolean enabled;

    @Value("${app.integrations.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${app.integrations.cloudinary.api-key}")
    private String apiKey;

    @Value("${app.integrations.cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (!enabled) {
            log.warn("Cloudinary integration is disabled");
            return null;
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
