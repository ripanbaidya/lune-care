package com.healthcare.payment.mapper;

import com.healthcare.payment.entity.PaymentGatewayDetail;
import com.healthcare.payment.entity.PaymentRecord;
import com.healthcare.payment.payload.response.PaymentResponse;

public final class PaymentMapper {

    private PaymentMapper() {
    }

    /**
     * Full mapping — includes clientSecret. Used to initiatePayment response only.
     */
    public static PaymentResponse toResponse(PaymentRecord paymentRecord) {
        return toResponseBuilder(paymentRecord)
                .clientSecret(paymentRecord.getGatewayDetail().getClientSecret())
                .build();
    }

    /**
     * Mapping without clientSecret — used for history, getByAppointmentId, etc.
     * Client secret should not be exposed outside the initiation flow.
     */
    public static PaymentResponse toSafeResponse(PaymentRecord paymentRecord) {
        return toResponseBuilder(paymentRecord).build();
    }

    private static PaymentResponse.PaymentResponseBuilder toResponseBuilder(PaymentRecord paymentRecord) {
        PaymentGatewayDetail detail = paymentRecord.getGatewayDetail();
        return PaymentResponse.builder()
                .id(paymentRecord.getId())
                .appointmentId(paymentRecord.getAppointmentId())
                .patientId(paymentRecord.getPatientId())
                .amount(paymentRecord.getAmount())
                .currency(paymentRecord.getCurrency())
                .gateway(paymentRecord.getGateway())
                .status(paymentRecord.getStatus())
                .createdAt(paymentRecord.getCreatedAt())
                .razorpayOrderId(detail.getRazorpayOrderId())
                .razorpayPaymentId(detail.getRazorpayPaymentId())
                .stripePaymentIntentId(detail.getStripePaymentIntentId());
    }
}