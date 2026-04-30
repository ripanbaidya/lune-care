package com.healthcare.payment.gateway;

/**
 * Unified result of a gateway order creation.
 * <p>
 * Razorpay: {@code gatewayOrderId} = Razorpay order ID, {@code clientSecret} = null <br>
 * Stripe:   {@code gatewayOrderId} = PaymentIntent ID, {@code clientSecret} = Stripe client secret
 * (client secret is required by Stripe.js on the frontend to complete payment)
 */
public record OrderResult(
        String gatewayOrderId,
        String clientSecret
) {

    /**
     * Convenience factory for gateways that do not use a client secret (Razorpay).
     */
    public static OrderResult of(String gatewayOrderId) {
        return new OrderResult(gatewayOrderId, null);
    }
}