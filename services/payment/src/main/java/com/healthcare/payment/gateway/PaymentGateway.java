package com.healthcare.payment.gateway;


import com.healthcare.payment.enums.PaymentGatewayType;

import java.math.BigDecimal;

public interface PaymentGateway {

    /**
     * Used by the registry to build the gateway map
     */
    PaymentGatewayType getType();

    /**
     * Creates a payment order / payment intent on the gateway.
     *
     * @return {@link OrderResult} containing the gateway order ID and optional client secret
     */
    OrderResult createOrder(String appointmentId, BigDecimal amount, String currency);

    /**
     * Verifies that a payment was genuinely completed.
     * <br>Razorpay: HMAC-SHA256 signature check (orderId | paymentId, secret)
     * <br>Stripe: Retrieves PaymentIntent from Stripe API and checks status == "succeeded"
     * (gatewayPaymentId and signature are unused for Stripe — pass null)
     */
    boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String signature);

    /**
     * Initiates a full refund and returns the gateway refund ID.
     * <br>Razorpay: refunds against {@code razorpayPaymentId}
     * <br>Stripe: refunds against {@code stripePaymentIntentId}
     */
    String refund(String gatewayPaymentId, BigDecimal amount);
}