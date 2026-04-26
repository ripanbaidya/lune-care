package com.healthcare.appointment.entity;

import com.healthcare.appointment.enums.AppointmentStatus;
import com.healthcare.appointment.enums.CancelledBy;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments",
        indexes = {
                @Index(name = "idx_appointment_patient_id", columnList = "patient_id"),
                @Index(name = "idx_appointment_doctor_id", columnList = "doctor_id"),
                @Index(name = "idx_appointment_status", columnList = "status"),
                @Index(name = "idx_appointment_date", columnList = "appointment_date")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "clinic_id", nullable = false)
    private String clinicId;

    @Column(name = "slot_id", nullable = false)
    private String slotId;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 25)
    private AppointmentStatus status = AppointmentStatus.PENDING_PAYMENT;

    /**
     * Snapshot of fees at booking time - fees may change later, this preserves what
     * the patient was charged
     */
    @Column(name = "consultation_fees", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFees;

    /**
     * Payment ID will be set by {@code payment-service} only if the payment is
     * confirmed.
     */
    @Column(name = "payment_id")
    private String paymentId;

    /**
     * In case if any doctor or patient wants to cancel the appointment, this field will
     * contain the reason for cancellation.
     * There might be cases where the cancellation is not due to any reason (system), which
     * we will handle separately.
     */
    @Column(name = "cancellation_reason")
    private String cancellationReason;

    /**
     * If the appointment is cancelled, that cancellation happened by whom will be stored here.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "cancelled_by", length = 10)
    private CancelledBy cancelledBy;

    /**
     * Optimistic locking on appointment as well — prevents concurrent status updates
     */
    @Version
    @Builder.Default
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}