package com.healthcare.payment.gateway.razorpay;

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

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties properties;

    // Create Razorpay order
    // Amount must be in smallest currency unit (paise for INR: ₹500 = 50000 paise)
    @Override
    public String createOrder(String appointmentId, BigDecimal amount, String currency) {
        try {
            JSONObject orderRequest = new JSONObject();
            // Convert rupees to paise — Razorpay requires smallest unit
            orderRequest.put("amount", amount
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .intValue());
            orderRequest.put("currency", currency);
            // Receipt is your internal reference — max 40 chars
            orderRequest.put("receipt", "appt_" + appointmentId.substring(0, 8));
            orderRequest.put("payment_capture", 1); // auto-capture payment

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");

            log.info("Razorpay order created — orderId: {}, appointmentId: {}",
                    orderId, appointmentId);

            return orderId;

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed for appointmentId: {}. Error: {}",
                    appointmentId, e.getMessage());
            throw new PaymentException(ErrorCode.RAZORPAY_ORDER_CREATION_FAILED,
                    "Failed to create payment order: " + e.getMessage());
        }
    }

    // Verify payment signature
    // Razorpay signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
    // This verification ensures the payment response was genuinely from Razorpay
    // and was not tampered with by anyone in between.
    @Override
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String generatedSignature = hmacSha256(payload, properties.keySecret());
            boolean valid = generatedSignature.equals(signature);

            if (!valid) {
                log.warn("Signature mismatch — orderId: {}, paymentId: {}", orderId, paymentId);
            }

            return valid;

        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    // Initiate full refund
    @Override
    public String refund(String paymentId, BigDecimal amount) {
        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", amount
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .intValue());
            refundRequest.put("speed", "normal"); // normal = 5-7 days, optimum = instant

            Refund refund = razorpayClient.payments.refund(paymentId, refundRequest);
            String refundId = refund.get("id");

            log.info("Razorpay refund initiated — refundId: {}, paymentId: {}",
                    refundId, paymentId);

            return refundId;

        } catch (RazorpayException e) {
            log.error("Razorpay refund failed for paymentId: {}. Error: {}",
                    paymentId, e.getMessage());
            throw new PaymentException(ErrorCode.REFUND_FAILED,
                    "Refund processing failed: " + e.getMessage());
        }
    }

    // HMAC-SHA256 helper
    private String hmacSha256(String data, String secret) throws NoSuchAlgorithmException,
            InvalidKeyException {

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        Formatter formatter = new Formatter();
        for (byte b : hash) {
            formatter.format("%02x", b);
        }

        return formatter.toString();
    }
}