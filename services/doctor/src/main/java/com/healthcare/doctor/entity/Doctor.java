package com.healthcare.doctor.entity;

import com.healthcare.doctor.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;

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

    /**
     * The {@code accountStatus} field is present inside the {@code auth-service} which is works
     * as an identity provider for our application.
     * We are manintaining this field here to keep track of the status of the doctor's account to
     * perfrom ceration actions to improve the performance.
     * <p><b>Note:</b> Make sure keep this field in sync with the {@code auth-service}
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", length = 30)
    private AccountStatus accountStatus = AccountStatus.ONBOARDING;

    /*
     * ------- Onboarding Workflow -------
     * The doctor onboarding process consists of three sequential stages:
     * 1. Account Creation: The doctor registers by providing: first & last name, phoneNumber, password
     * 2. Profile Completion: The doctor uploads a profile photo and completes profile details such as
     * bio, experience and additional professional information.
     * 3. Document Submission & Verification
     * - The doctor uploads required documents (e.g., certifications, licenses).
     * - Although the system is designed to support multiple documents per doctor, the current implementation
     * restricts this to a single document.
     * - An admin reviews and verifies the submitted document.
     * - Only after successful verification is the doctor allowed full access to application services.
     *
     * Implementation Note:
     * - For the current development phase, Stage 3 (document verification) is bypassed at the backend level
     * to reduce development overhead.
     * - The doctor's profile is marked as active immediately after completing Stage 2.
     * - However, the frontend enforces completion of all three stages to simulate the intended onboarding flow
     * and restrict premature access.
     */
    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted = false;

    @Column(name = "document_verified", nullable = false)
    private boolean documentVerified = false;

    @OneToOne(
            mappedBy = "doctor",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DoctorProfile profile;

    @OneToMany(
            mappedBy = "doctor",
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Clinic> clinics;

    @OneToMany(
            mappedBy = "doctor",
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DoctorDocument> documents;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}