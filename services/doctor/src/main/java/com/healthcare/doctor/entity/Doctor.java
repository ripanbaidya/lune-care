package com.healthcare.doctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "doctors",
        indexes = {
                @Index(name = "idx_doctor_user_id", columnList = "user_id", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;

    /*
     * Scalability hook — right now flipping this to true activates the account.
     * Later when document verification is added, activation will require this flag and
     * a documentVerified flag to activate the doctor account.
     */
    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted = false;

    @OneToOne(
            mappedBy = "doctor",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DoctorProfile profile;

    @OneToMany(
            mappedBy = "doctor",
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Clinic> clinics;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}