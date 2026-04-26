package com.healthcare.appointment.entity;

import com.healthcare.appointment.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "slots",
        indexes = {
                @Index(
                        name = "idx_slot_doctor_clinic_date",
                        columnList = "doctor_id, clinic_id, slot_date"
                ),
                @Index(
                        name = "idx_slot_status", columnList = "status"
                )
        },
        uniqueConstraints = {
                // A doctor cannot have two slots at the same time in the same clinic
                @UniqueConstraint(
                        name = "uk_slot_doctor_clinic_date_time",
                        columnNames = {"doctor_id", "clinic_id", "slot_date", "start_time"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "clinic_id", nullable = false)
    private String clinicId;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SlotStatus status = SlotStatus.AVAILABLE;

    /**
     * Optimistic locking
     * Hibernate adds WHERE {@code version = ?} to every {@code UPDATE}.
     * If two transactions read the same slot simultaneously and both try to change status to LOCKED,
     * the second will get OptimisticLockException because the first already incremented the version.
     */
    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}