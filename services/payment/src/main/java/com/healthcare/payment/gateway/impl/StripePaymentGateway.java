package com.healthcare.payment.gateway.impl;

import com.healthcare.payment.config.properties.StripeProperties;
import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.exception.PaymentException;
import com.healthcare.payment.gateway.OrderResult;
import com.healthcare.payment.gateway.PaymentGateway;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.payment.gateway.stripe", name = "enabled", havingValue = "true")
public class StripePaymentGateway implements PaymentGateway {

    private static final int CURRENCY_MULTIPLIER = 100; // paise (INR)

    private final StripeProperties properties;

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.STRIPE;
    }

    /**
     * Creates a Stripe PaymentIntent and returns both the PaymentIntent ID (for backend tracking)
     * and the client secret (for the frontend to complete payment with Stripe.js).
     * <p>
     * The frontend uses the client secret with {@code stripe.confirmPayment()} or
     * {@code stripe.confirmCardPayment()}. After the user completes payment on the frontend,
     * the backend verifies by retrieving the PaymentIntent and checking its status.
     *
     * @return {@link OrderResult} where {@code gatewayOrderId} = PaymentIntent ID,
     * {@code clientSecret} = Stripe client secret for Stripe.js
     */
    @Override
    public OrderResult createOrder(String appointmentId, BigDecimal amount, String currency) {
        log.debug("Creating Stripe PaymentIntent — appointmentId: {}, amount: {} {}",
                appointmentId, amount, currency);

        try {
            RequestOptions requestOptions = buildRequestOptions();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(toStripeAmount(amount))
                    .setCurrency(currency.toLowerCase())
                    // Metadata lets you trace the PaymentIntent back to your appointment
                    // from the Stripe dashboard or webhooks
                    .putMetadata("appointmentId", appointmentId)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params, requestOptions);

            log.info("Stripe PaymentIntent created — paymentIntentId: {}, appointmentId: {}, amount: {} {}",
                    paymentIntent.getId(), appointmentId, amount, currency);

            return new OrderResult(paymentIntent.getId(), paymentIntent.getClientSecret());

        } catch (StripeException e) {
            log.error("Stripe PaymentIntent creation failed — appointmentId: {}, code: {}, error: {}",
                    appointmentId, e.getCode(), e.getMessage());
            throw new PaymentException(ErrorCode.STRIPE_ORDER_CREATION_FAILED,
                    "Failed to create Stripe payment intent: " + e.getMessage());
        }
    }

    /**
     * Verifies payment by retrieving the PaymentIntent from Stripe and checking its status.
     * <p>Unlike Razorpay (HMAC signature), Stripe verification is done server-side by fetching
     * the PaymentIntent directly from Stripe's API — so {@code gatewayPaymentId} and
     * {@code signature} are unused here.
     *
     * @param gatewayOrderId the Stripe PaymentIntent ID (pi_...)
     */
    @Override
    public boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String signature) {
        log.debug("Verifying Stripe payment — paymentIntentId: {}", gatewayOrderId);

        try {
            RequestOptions requestOptions = buildRequestOptions();
            PaymentIntent paymentIntent = PaymentIntent.retrieve(gatewayOrderId, requestOptions);

            String status = paymentIntent.getStatus();
            boolean succeeded = "succeeded".equals(status);

            if (succeeded) {
                log.debug("Stripe payment verification passed — paymentIntentId: {}", gatewayOrderId);
            } else {
                log.warn("Stripe payment not succeeded — paymentIntentId: {}, status: {}",
                        gatewayOrderId, status);
            }

            return succeeded;

        } catch (StripeException e) {
            log.error("Stripe payment verification error — paymentIntentId: {}, code: {}, error: {}",
                    gatewayOrderId, e.getCode(), e.getMessage());
            return false;
        }
    }

    /**
     * Initiates a full refund against a Stripe PaymentIntent.
     * <p>For Stripe, refunds are issued against the PaymentIntent ID (pi_...), not a
     * separate payment/charge ID as in Razorpay.
     *
     * @param gatewayPaymentId the Stripe PaymentIntent ID (pi_...)
     * @return the Stripe refund ID (re_...)
     */
    @Override
    public String refund(String gatewayPaymentId, BigDecimal amount) {
        log.debug("Initiating Stripe refund — paymentIntentId: {}, amount: {}",
                gatewayPaymentId, amount);

        try {
            RequestOptions requestOptions = buildRequestOptions();

            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(gatewayPaymentId)
                    .setAmount(toStripeAmount(amount))
                    .build();

            Refund refund = Refund.create(params, requestOptions);

            log.info("Stripe refund initiated — refundId: {}, paymentIntentId: {}, amount: {}",
                    refund.getId(), gatewayPaymentId, amount);

            return refund.getId();

        } catch (StripeException e) {
            log.error("Stripe refund failed — paymentIntentId: {}, code: {}, error: {}",
                    gatewayPaymentId, e.getCode(), e.getMessage());
            throw new PaymentException(ErrorCode.REFUND_FAILED,
                    "Stripe refund failed: " + e.getMessage());
        }
    }

    // Private helpers

    /**
     * Builds per-request options with the API key.
     * Using RequestOptions instead of global Stripe.apiKey is thread-safe and
     * allows different keys per request (useful for Stripe Connect in future).
     */
    private RequestOptions buildRequestOptions() {
        return RequestOptions.builder()
                .setApiKey(properties.secretKey())
                .build();
    }

    /**
     * Converts rupees to the smallest currency unit (paise for INR).
     * Stripe requires amounts in the smallest unit: ₹500 → 50000.
     */
    private long toStripeAmount(BigDecimal amountInRupees) {
        return amountInRupees
                .multiply(BigDecimal.valueOf(CURRENCY_MULTIPLIER))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }
}