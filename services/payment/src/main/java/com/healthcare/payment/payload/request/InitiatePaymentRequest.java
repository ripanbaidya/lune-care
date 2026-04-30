package com.healthcare.payment.payload.request;

import com.healthcare.payment.enums.PaymentGatewayType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InitiatePaymentRequest(

        @NotBlank(message = "Appointment ID is required")
        String appointmentId,

        /*
         * The payment gateway the patient wants to use.
         * Defaults to RAZORPAY if not provided — preserves backward compatibility.
         */
        @NotNull(message = "Gateway type is required")
        PaymentGatewayType gatewayType

) {
    /**
     * Default to RAZORPAY for backward compatibility
     */
    public InitiatePaymentRequest {
        if (gatewayType == null) {
            gatewayType = PaymentGatewayType.RAZORPAY;
        }
    }
}