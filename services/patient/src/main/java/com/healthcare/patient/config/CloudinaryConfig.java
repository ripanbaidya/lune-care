package com.healthcare.patient.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.healthcare.patient.config.properties.CloudinaryProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableConfigurationProperties(CloudinaryProperties.class)
public class CloudinaryConfig {

    @Bean
    @ConditionalOnProperty(prefix = "app.integrations.cloudinary", name = "enabled", havingValue = "true")
    public Cloudinary cloudinary(CloudinaryProperties properties) {
        log.info("Initializing Cloudinary with cloud: {}", properties.cloudName());
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.cloudName(),
                "api_key", properties.apiKey(),
                "api_secret", properties.apiSecret(),
                "secure", true
        ));
    }
}