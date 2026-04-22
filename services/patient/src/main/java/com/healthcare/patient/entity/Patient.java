package com.healthcare.patient.entity;

import com.healthcare.patient.enums.BloodGroup;
import com.healthcare.patient.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "patients",
        indexes = {
                @Index(name = "idx_patient_user_id", columnList = "user_id", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Logical FK to auth-service users table.
    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    // Storing the phone number here also because it's needed for patient profile
    // and can be used for other purposes.
    // It will be synced from auth-service during registration
    @Column(name = "phone_number", nullable = false, length = 10, unique = true)
    private String phoneNumber;

    /*
     * Optional fields — patient fills these after registration
     */

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", length = 15)
    private BloodGroup bloodGroup;

    /*
     * Cloudinary URL for the profile photo
     */
    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    /*
     * Public ID of the profile photo on Cloudinary
     * Used for deleting/updating the photo in Cloudinary when patient updates their profile picture
     */
    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}