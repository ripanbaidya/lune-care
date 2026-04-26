package com.healthcare.payment.gateway;


import java.math.BigDecimal;

// Strategy interface — Razorpay implements this now, Stripe will implement it later.
// PaymentServiceImpl depends only on this interface, never on a concrete class.
public interface PaymentGateway {

    // Creates a payment order and returns the gateway's order ID
    String createOrder(String appointmentId, BigDecimal amount, String currency);

    // Verifies the payment signature — returns true if genuine
    boolean verifyPayment(String orderId, String paymentId, String signature);

    // Initiates a full refund and returns the refund ID
    String refund(String paymentId, BigDecimal amount);
}