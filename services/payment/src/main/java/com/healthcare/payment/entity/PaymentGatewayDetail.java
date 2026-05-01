package com.healthcare.payment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_gateway_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentGatewayDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_record_id", nullable = false, unique = true)
    private PaymentRecord paymentRecord;

    // Razorpay fields
    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_refund_id")
    private String razorpayRefundId;

    // Stripe fields
    @Column(name = "stripe_payment_intent_id", unique = true)
    private String stripePaymentIntentId;

    @Column(name = "client_secret")
    private String clientSecret;

    @Column(name = "stripe_refund_id")
    private String stripeRefundId;
}