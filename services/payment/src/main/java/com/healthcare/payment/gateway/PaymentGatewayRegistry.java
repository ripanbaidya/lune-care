package com.healthcare.payment.gateway;

import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.exception.PaymentException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Strategy registry for payment gateways.
 * <p>Spring injects all {@link PaymentGateway} beans present in the context
 * (conditional on properties). Each gateway self-reports its type via {@link PaymentGateway#getType()}.
 * The registry builds an immutable map and provides a clean lookup by {@link PaymentGatewayType}.
 * <p>If a gateway is disabled (e.g., Stripe disabled in config), its bean is not created,
 * and it won't appear in this map. Calling {@link #getGateway} for a disabled gateway
 * throws a meaningful {@link PaymentException} instead of a NPE.
 */
@Slf4j
@Component
public class PaymentGatewayRegistry {

    private final Map<PaymentGatewayType, PaymentGateway> gateways;

    public PaymentGatewayRegistry(List<PaymentGateway> availableGateways) {
        this.gateways = availableGateways.stream()
                .collect(Collectors.toMap(
                        PaymentGateway::getType,
                        Function.identity(),
                        (existing, duplicate) -> {
                            throw new IllegalStateException("Duplicate payment gateway registered for type: "
                                    + existing.getType());
                        }, () -> new EnumMap<>(PaymentGatewayType.class)
                ));

        log.info("Payment gateways registered: {}", gateways.keySet());
    }

    /**
     * Returns the gateway implementation for the given type.
     *
     * @throws PaymentException if the gateway is not configured / disabled
     */
    public PaymentGateway getGateway(PaymentGatewayType type) {
        PaymentGateway gateway = gateways.get(type);
        if (gateway == null) {
            log.error("Payment gateway not available — type: {}. Registered gateways: {}", type, gateways.keySet());
            throw new PaymentException(ErrorCode.GATEWAY_NOT_AVAILABLE,
                    "Payment gateway is not configured: " + type);
        }

        return gateway;
    }

    public boolean isAvailable(PaymentGatewayType type) {
        return gateways.containsKey(type);
    }
}