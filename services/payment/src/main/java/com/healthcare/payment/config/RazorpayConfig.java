package com.healthcare.payment.config;

import com.healthcare.payment.config.properties.RazorpayProperties;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RazorpayConfig {

    private final RazorpayProperties properties;

    @Bean
    @ConditionalOnProperty(name = "app.payment.gateway.razorpay.enabled", havingValue = "true")
    public RazorpayClient razorpayClient() throws RazorpayException {
        log.info("Initializing Razorpay client");
        return new RazorpayClient(properties.keyId(), properties.keySecret());
    }
}