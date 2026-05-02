package com.healthcare.payment.payload.request;

import com.healthcare.payment.enums.PaymentGatewayType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for initiating a payment against a booked appointment")
public record InitiatePaymentRequest(

        @Schema(
                description = "ID of the appointment to initiate payment for",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        @Schema(
                description = "Payment gateway to use. Defaults to RAZORPAY if not provided",
                example = "RAZORPAY",
                allowableValues = {"RAZORPAY", "STRIPE"}
        )
        @NotNull(message = "Gateway type is required")
        PaymentGatewayType gatewayType
) {
    public InitiatePaymentRequest {
        if (gatewayType == null) {
            gatewayType = PaymentGatewayType.RAZORPAY;
        }
    }
}