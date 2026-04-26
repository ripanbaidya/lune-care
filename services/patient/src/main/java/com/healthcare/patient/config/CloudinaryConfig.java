package com.healthcare.patient.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.healthcare.patient.config.properties.CloudinaryProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final CloudinaryProperties properties;

    @Bean
    public Cloudinary cloudinary() {
        if (!properties.enabled()) {
            log.warn("Cloudinary integration is disabled");
            return null;
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.cloudName(),
                "api_key", properties.apiKey(),
                "api_secret", properties.apiSecret(),
                "secure", true
        ));
    }
}
