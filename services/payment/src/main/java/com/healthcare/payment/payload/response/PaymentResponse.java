package com.healthcare.payment.payload.response;

import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.enums.PaymentStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Builder
public record PaymentResponse(
        String id,
        String appointmentId,
        String patientId,
        BigDecimal amount,
        String currency,
        String razorpayOrderId,
        String razorpayPaymentId,
        PaymentStatus status,
        PaymentGatewayType gateway,
        Instant createdAt
) {
}