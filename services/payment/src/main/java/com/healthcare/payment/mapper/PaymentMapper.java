package com.healthcare.payment.mapper;

import com.healthcare.payment.entity.PaymentRecord;
import com.healthcare.payment.payload.response.PaymentResponse;

public final class PaymentMapper {

    private PaymentMapper() {
    }

    public static PaymentResponse toResponse(PaymentRecord paymentRecord) {
        return PaymentResponse.builder()
                .id(paymentRecord.getId())
                .appointmentId(paymentRecord.getAppointmentId())
                .patientId(paymentRecord.getPatientId())
                .amount(paymentRecord.getAmount())
                .currency(paymentRecord.getCurrency())
                .razorpayOrderId(paymentRecord.getRazorpayOrderId())
                .razorpayPaymentId(paymentRecord.getRazorpayPaymentId())
                .status(paymentRecord.getStatus())
                .gateway(paymentRecord.getGateway())
                .createdAt(paymentRecord.getCreatedAt())
                .build();
    }
}
