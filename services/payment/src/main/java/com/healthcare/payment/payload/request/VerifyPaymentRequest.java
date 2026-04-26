package com.healthcare.payment.payload.request;

import jakarta.validation.constraints.NotBlank;

public record VerifyPaymentRequest(

        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        @NotBlank(message = "Razorpay payment ID is required")
        String razorpayPaymentId,

        @NotBlank(message = "Razorpay order ID is required")
        String razorpayOrderId,

        @NotBlank(message = "Razorpay signature is required")
        String razorpaySignature
) {
}