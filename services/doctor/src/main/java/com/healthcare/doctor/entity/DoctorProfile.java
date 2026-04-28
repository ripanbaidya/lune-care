package com.healthcare.doctor.entity;

import com.healthcare.doctor.enums.Gender;
import com.healthcare.doctor.enums.Specialization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@NoArgsConstructor
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", unique = true, nullable = false)
    private Doctor doctor;

    @Column(name = "email", length = 120)
    private String email; // optional

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "specialization", length = 50)
    private Specialization specialization;

    @Column(name = "qualification", length = 100)
    private String qualification;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "bio", length = 250)
    private String bio;

    /*
     * Stores the collection in a separate table
     */
    @ElementCollection
    @CollectionTable(
            name = "doctor_languages",
            joinColumns = @JoinColumn(name = "doctor_profile_id"))
    @Column(name = "language", length = 50)
    private List<String> languagesSpoken;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;
}