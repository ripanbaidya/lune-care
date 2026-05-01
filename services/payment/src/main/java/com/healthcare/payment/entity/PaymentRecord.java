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

    @Column(name = "appointment_id", unique = true, nullable = false)
    private String appointmentId;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @OneToOne(mappedBy = "paymentRecord", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, optional = false)
    private PaymentGatewayDetail gatewayDetail;

    // Common fields
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