package com.healthcare.payment.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.enums.PaymentStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaymentResponse(
        String id,
        String appointmentId,
        String patientId,
        BigDecimal amount,
        String currency,
        PaymentGatewayType gateway,
        PaymentStatus status,
        Instant createdAt,

        // Razorpay-specific — null for Stripe payments
        String razorpayOrderId,
        String razorpayPaymentId,

        // Stripe-specific — null for Razorpay payments
        String stripePaymentIntentId,

        /*
         * Stripe client secret — ONLY populated on initiatePayment response.
         * The frontend needs this to call stripe.confirmPayment() / stripe.confirmCardPayment().
         * Not included in history or getPaymentByAppointmentId responses.
         */
        String clientSecret
) {
}