package com.healthcare.payment.config;

import com.healthcare.payment.config.properties.RazorpayProperties;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RazorpayConfig {

    private final RazorpayProperties properties;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (!properties.enabled()) {
            log.warn("Razorpay payment gateway is disabled");
            return null;
        }

        log.info("Initializing Razorpay client");
        return new RazorpayClient(properties.keyId(), properties.keySecret());
    }
}