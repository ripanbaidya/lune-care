package com.healthcare.payment.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Schema(description = "Payment details returned after initiation, verification or history lookup")
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaymentResponse(

        @Schema(description = "Payment record ID")
        String id,

        @Schema(description = "Associated appointment ID")
        String appointmentId,

        @Schema(description = "Patient's user ID who made the payment")
        String patientId,

        @Schema(description = "Payment amount in INR", example = "500.00")
        BigDecimal amount,

        @Schema(description = "Currency code", example = "INR")
        String currency,

        @Schema(
                description = "Payment gateway used for this transaction",
                example = "RAZORPAY",
                allowableValues = {"RAZORPAY", "STRIPE"}
        )
        PaymentGatewayType gateway,

        @Schema(
                description = "Current payment status",
                example = "COMPLETED",
                allowableValues = {"INITIATED", "COMPLETED", "FAILED", "REFUNDED"}
        )
        PaymentStatus status,

        @Schema(description = "Timestamp when the payment record was created")
        Instant createdAt,

        // Razorpay fields

        @Schema(description = "[Razorpay only] Razorpay order ID — null for Stripe payments")
        String razorpayOrderId,

        @Schema(description = "[Razorpay only] Razorpay payment ID — null for Stripe payments")
        String razorpayPaymentId,

        // Stripe fields

        @Schema(description = "[Stripe only] Stripe PaymentIntent ID — null for Razorpay payments")
        String stripePaymentIntentId,

        @Schema(
                description = "[Stripe only] Client secret required by the frontend to call " +
                        "stripe.confirmPayment(). Only populated in the initiatePayment response. " +
                        "Null in history and getByAppointmentId responses."
        )
        String clientSecret
) {
}