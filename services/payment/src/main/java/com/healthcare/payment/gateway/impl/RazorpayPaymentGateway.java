package com.healthcare.payment.gateway.impl;

import com.healthcare.payment.config.properties.RazorpayProperties;
import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.exception.PaymentException;
import com.healthcare.payment.gateway.OrderResult;
import com.healthcare.payment.gateway.PaymentGateway;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;

@Slf4j
@Component
@ConditionalOnBean(RazorpayClient.class)
@RequiredArgsConstructor
public class RazorpayPaymentGateway implements PaymentGateway {

    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    private static final int PAISE_MULTIPLIER = 100;

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties properties;

    @Override
    public PaymentGatewayType getType() {
        return PaymentGatewayType.RAZORPAY;
    }

    @Override
    public OrderResult createOrder(String appointmentId, BigDecimal amount, String currency) {
        log.debug("Creating Razorpay order — appointmentId: {}, amount: {} {}",
                appointmentId, amount, currency);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", toPaise(amount));
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "appt_" + appointmentId.substring(0, 8));
            orderRequest.put("payment_capture", 1);

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");

            log.info("Razorpay order created — orderId: {}, appointmentId: {}, amount: {} {}",
                    orderId, appointmentId, amount, currency);

            // Razorpay has no client secret — use the factory method
            return OrderResult.of(orderId);

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed — appointmentId: {}, error: {}",
                    appointmentId, e.getMessage());
            throw new PaymentException(ErrorCode.RAZORPAY_ORDER_CREATION_FAILED,
                    "Failed to create payment order: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String signature) {
        log.debug("Verifying Razorpay signature — orderId: {}, paymentId: {}",
                gatewayOrderId, gatewayPaymentId);

        try {
            String payload = gatewayOrderId + "|" + gatewayPaymentId;
            String generatedSignature = hmacSha256(payload, properties.keySecret());
            boolean valid = generatedSignature.equals(signature);

            if (valid) {
                log.debug("Razorpay signature verification passed — orderId: {}", gatewayOrderId);
            } else {
                log.warn("Razorpay signature verification failed — orderId: {}, paymentId: {}",
                        gatewayOrderId, gatewayPaymentId);
            }

            return valid;

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Razorpay signature computation error — orderId: {}, error: {}",
                    gatewayOrderId, e.getMessage());
            return false;
        }
    }

    @Override
    public String refund(String gatewayPaymentId, BigDecimal amount) {
        log.debug("Initiating Razorpay refund — paymentId: {}, amount: {}", gatewayPaymentId, amount);

        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", toPaise(amount));
            refundRequest.put("speed", "normal");

            Refund refund = razorpayClient.payments.refund(gatewayPaymentId, refundRequest);
            String refundId = refund.get("id");

            log.info("Razorpay refund initiated — refundId: {}, paymentId: {}, amount: {}",
                    refundId, gatewayPaymentId, amount);

            return refundId;

        } catch (RazorpayException e) {
            log.error("Razorpay refund failed — paymentId: {}, amount: {}, error: {}",
                    gatewayPaymentId, amount, e.getMessage());
            throw new PaymentException(ErrorCode.REFUND_FAILED,
                    "Refund processing failed: " + e.getMessage());
        }
    }

    // Helper methods

    /**
     * Converts amount in rupees to paise.
     */
    private int toPaise(BigDecimal amountInRupees) {
        return amountInRupees
                .multiply(BigDecimal.valueOf(PAISE_MULTIPLIER))
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
    }

    /**
     * Computes HMAC-SHA256 signature.
     */
    private String hmacSha256(String data, String secret)
            throws NoSuchAlgorithmException, InvalidKeyException {

        Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256_ALGORITHM);
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        Formatter formatter = new Formatter();
        try {
            for (byte b : hash) formatter.format("%02x", b);
            return formatter.toString();
        } finally {
            formatter.close();
        }
    }
}