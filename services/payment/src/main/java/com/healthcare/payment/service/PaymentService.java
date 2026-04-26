package com.healthcare.payment.service;

import com.healthcare.payment.event.AppointmentCancelledEvent;
import com.healthcare.payment.payload.request.InitiatePaymentRequest;
import com.healthcare.payment.payload.request.VerifyPaymentRequest;
import com.healthcare.payment.payload.response.PaymentResponse;
import org.springframework.data.domain.Page;

public interface PaymentService {

    PaymentResponse initiatePayment(String patientId, InitiatePaymentRequest request);

    PaymentResponse verifyPayment(String patientId, VerifyPaymentRequest request);

    PaymentResponse getPaymentByAppointmentId(String appointmentId);

    Page<PaymentResponse> getPaymentHistory(String patientId, int page, int size);

    void processRefund(AppointmentCancelledEvent event);
}