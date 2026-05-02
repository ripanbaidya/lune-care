package com.healthcare.payment.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(
        description = "Request payload for verifying payment after the frontend completes the " +
                "gateway checkout. Provide Razorpay fields or Stripe fields depending on the gateway used."
)
public record VerifyPaymentRequest(

        @Schema(
                description = "ID of the appointment for which payment was made",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        // Razorpay fields

        @Schema(
                description = "[Razorpay only] Payment ID returned by Razorpay after checkout",
                example = "pay_ABC123"
        )
        String razorpayPaymentId,

        @Schema(
                description = "[Razorpay only] Order ID created during payment initiation",
                example = "order_XYZ456"
        )
        String razorpayOrderId,

        @Schema(
                description = "[Razorpay only] HMAC-SHA256 signature for payment verification",
                example = "abc123signature"
        )
        String razorpaySignature,

        // Stripe fields

        @Schema(
                description = "[Stripe only] PaymentIntent ID (pi_...) returned by the frontend " +
                        "after stripe.confirmPayment() succeeds",
                example = "pi_3OqXYZ2eZvKYlo2C1234"
        )
        String stripePaymentIntentId
) {
}