package com.healthcare.payment.gateway.impl;

import com.healthcare.payment.config.properties.RazorpayProperties;
import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.exception.PaymentException;
import com.healthcare.payment.gateway.PaymentGateway;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
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
@RequiredArgsConstructor
public class RazorpayPaymentGateway implements PaymentGateway {

    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    private static final String PAISE_MULTIPLIER_KEY = "amount";
    private static final int PAISE_MULTIPLIER = 100;

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties properties;

    /**
     * Creates a Razorpay order and returns the gateway order ID.
     * <p>Amount is converted from rupees to paise (₹500 → 50000) because Razorpay
     * requires the smallest currency unit.
     *
     * @param appointmentId internal reference, used as the receipt (max 40 chars)
     * @param amount        amount in rupees
     * @param currency      ISO 4217 currency code (e.g. "INR")
     * @return Razorpay order ID
     * @throws PaymentException if Razorpay order creation fails
     */
    @Override
    public String createOrder(String appointmentId, BigDecimal amount, String currency) {
        log.debug("Creating Razorpay order — appointmentId: {}, amount: {} {}",
                appointmentId, amount, currency);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put(PAISE_MULTIPLIER_KEY, toPaise(amount));
            orderRequest.put("currency", currency);

            // Receipt is Razorpay's internal reference — max 40 chars
            orderRequest.put("receipt", "appt_" + appointmentId.substring(0, 8));
            orderRequest.put("payment_capture", 1); // auto-capture

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");

            log.info("Razorpay order created — orderId: {}, appointmentId: {}, amount: {} {}",
                    orderId, appointmentId, amount, currency);

            return orderId;

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed — appointmentId: {}, error: {}",
                    appointmentId, e.getMessage());
            throw new PaymentException(ErrorCode.RAZORPAY_ORDER_CREATION_FAILED,
                    "Failed to create payment order: " + e.getMessage());
        }
    }

    /**
     * Verifies the Razorpay payment signature using HMAC-SHA256.
     * <p>Signature = HMAC-SHA256({orderId}|{paymentId}, keySecret).
     * This ensures the callback came from Razorpay and was not tampered with.
     *
     * @return {@code true} if the signature is valid, {@code false} otherwise
     */
    @Override
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        log.debug("Verifying payment signature — orderId: {}, paymentId: {}",
                orderId, paymentId);

        try {
            String payload = orderId + "|" + paymentId;
            String generatedSignature = hmacSha256(payload, properties.keySecret());
            boolean valid = generatedSignature.equals(signature);

            if (valid) {
                log.debug("Signature verification passed — orderId: {}", orderId);
            } else {
                log.warn("Signature verification failed — orderId: {}, paymentId: {}", orderId, paymentId);
            }

            return valid;

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Signature computation error — orderId: {}, error: {}", orderId, e.getMessage());
            return false;
        }
    }

    /**
     * Initiates a full refund via Razorpay and returns the refund ID.
     *
     * @param paymentId Razorpay payment ID to refund
     * @param amount    amount to refund in rupees
     * @return Razorpay refund ID
     * @throws PaymentException if the refund API call fails
     */
    @Override
    public String refund(String paymentId, BigDecimal amount) {
        log.debug("Initiating Razorpay refund — paymentId: {}, amount: {}", paymentId, amount);

        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put(PAISE_MULTIPLIER_KEY, toPaise(amount));
            refundRequest.put("speed", "normal"); // normal = 5–7 days; optimum = instant

            Refund refund = razorpayClient.payments.refund(paymentId, refundRequest);
            String refundId = refund.get("id");

            log.info("Razorpay refund initiated — refundId: {}, paymentId: {}, amount: {}",
                    refundId, paymentId, amount);

            return refundId;

        } catch (RazorpayException e) {
            log.error("Razorpay refund failed — paymentId: {}, amount: {}, error: {}",
                    paymentId, amount, e.getMessage());
            throw new PaymentException(ErrorCode.REFUND_FAILED,
                    "Refund processing failed: " + e.getMessage());
        }
    }

    /*
     * Helpers
     */

    /**
     * Converts rupees to paisee (Smallest INR unit requried by Razorpay)
     */
    private int toPaise(BigDecimal amountInRupees) {
        return amountInRupees
                .multiply(BigDecimal.valueOf(PAISE_MULTIPLIER))
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
    }

    /**
     * Computes HMAC-SHA256 of {@code data} using {@code secret} and returns
     * the result as a lowercase hex string.
     */
    private String hmacSha256(String data, String secret)
            throws NoSuchAlgorithmException, InvalidKeyException {

        Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256_ALGORITHM);
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        Formatter formatter = new Formatter();
        for (byte b : hash) {
            formatter.format("%02x", b);
        }

        formatter.close();
        return formatter.toString();
    }
}