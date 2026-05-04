package com.healthcare.payment.config;

import com.healthcare.payment.config.properties.RazorpayProperties;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableConfigurationProperties(RazorpayProperties.class)
public class RazorpayConfig {

    @Bean
    @ConditionalOnProperty(prefix = "app.payment.gateway.razorpay", name = "enabled", havingValue = "true")
    public RazorpayClient razorpayClient(RazorpayProperties properties) throws RazorpayException {
        log.debug("Initializing Razorpay client — enabled={}, keyId='{}', keySecret='{}'",
                properties.enabled(), properties.keyId(), properties.keySecret());

        return new RazorpayClient(properties.keyId(), properties.keySecret());
    }
}