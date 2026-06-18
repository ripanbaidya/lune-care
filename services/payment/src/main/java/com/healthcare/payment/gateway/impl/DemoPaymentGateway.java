package com.healthcare.payment.gateway.impl;

import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.gateway.OrderResult;
import com.healthcare.payment.gateway.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "app.payment.demo", name = "enabled", havingValue = "true")
public class DemoPaymentGateway implements PaymentGateway {

    private static final String DEMO_ORDER_PREFIX = "demo_order_";
    private static final String DEMO_REFUND_PREFIX = "demo_refund_";

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.DEMO;
    }

    @Override
    public OrderResult createOrder(String appointmentId, BigDecimal amount, String currency) {
        String demoSessionId = DEMO_ORDER_PREFIX + UUID.randomUUID().toString().replace("-", "");
        log.info("Demo payment session created — appointmentId: {}, sessionId: {}, amount: {} {}",
                appointmentId, demoSessionId, amount, currency);
        return OrderResult.of(demoSessionId);
    }

    @Override
    public boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String signature) {
        log.info("Demo payment verified — sessionId: {}", gatewayOrderId);
        return true;
    }

    @Override
    public String refund(String gatewayPaymentId, BigDecimal amount) {
        String refundId = DEMO_REFUND_PREFIX + UUID.randomUUID().toString().replace("-", "");
        log.info("Demo refund generated — paymentId: {}, refundId: {}, amount: {}",
                gatewayPaymentId, refundId, amount);
        return refundId;
    }
}
