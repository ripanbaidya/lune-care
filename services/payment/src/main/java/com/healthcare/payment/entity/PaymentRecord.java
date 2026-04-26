package com.healthcare.payment.entity;

import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "payment_records",
        indexes = {
                @Index(name = "idx_payment_appointment_id", columnList = "appointment_id", unique = true),
                @Index(name = "idx_payment_patient_id", columnList = "patient_id"),
                @Index(name = "idx_payment_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // One appointment can only have one payment record
    @Column(name = "appointment_id", unique = true, nullable = false)
    private String appointmentId;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    // Amount in INR — never trusted from frontend, fetched from appointment-service
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    // Razorpay order ID — created on initiate
    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    // Razorpay payment ID — set after successful verification
    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    // Razorpay refund ID — set after refund is processed
    @Column(name = "razorpay_refund_id")
    private String razorpayRefundId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.INITIATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "gateway", nullable = false, length = 20)
    @Builder.Default
    private PaymentGatewayType gateway = PaymentGatewayType.RAZORPAY;

    @Column(name = "failure_reason")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}