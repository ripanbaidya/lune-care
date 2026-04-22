package com.healthcare.doctor.entity;

import com.healthcare.doctor.enums.ClinicType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(
        name = "clinics",
        indexes = {
                @Index(name = "idx_clinic_doctor_id", columnList = "doctor_id")
        }
)
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Clinic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private ClinicType type;

    @Column(name = "consultation_fees",
            nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFees;

    @Column(name = "consultation_duration_minutes", nullable = false)
    private Integer consultationDurationMinutes;

    @Column(name = "contact_number", length = 15)
    private String contactNumber;

    /*
     * If we ever need to delete a clinic, we'll set this to false and filter it out
     * in queries to avoid breaking existing data like past appointments, reviews, etc.
     */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "address_line")
    private String addressLine;

    @Column(name = "city", length = 80)
    private String city;

    @Column(name = "state", length = 80)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Builder.Default
    @Column(name = "country", length = 60)
    private String country = "India";

    @OneToMany(
            mappedBy = "clinic",
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClinicSchedule> schedules;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}