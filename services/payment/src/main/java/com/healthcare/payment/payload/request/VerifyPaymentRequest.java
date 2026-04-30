package com.healthcare.payment.payload.request;

import jakarta.validation.constraints.NotBlank;

public record VerifyPaymentRequest(

        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        // Razorpay fields (required when gateway = RAZORPAY)
        String razorpayPaymentId,
        String razorpayOrderId,
        String razorpaySignature,

        // Stripe fields (required when gateway = STRIPE)

        /*
         * The Stripe PaymentIntent ID (pi_...) returned by the frontend after
         * stripe.confirmPayment() succeeds. Used to retrieve and verify the
         * PaymentIntent status from Stripe's API.
         */
        String stripePaymentIntentId

) {
}