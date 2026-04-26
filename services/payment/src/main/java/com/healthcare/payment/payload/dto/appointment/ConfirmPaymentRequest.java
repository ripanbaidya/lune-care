package com.healthcare.payment.payload.dto.appointment;

public record ConfirmPaymentRequest(
        String appointmentId,
        String paymentId
) {}