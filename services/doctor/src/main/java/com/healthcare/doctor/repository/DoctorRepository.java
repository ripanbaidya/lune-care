package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.enums.AccountStatus;
import com.healthcare.doctor.enums.Specialization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {

    Optional<Doctor> findByUserId(String userId);

    boolean existsByUserId(String userId);

    @Query(value = """
                SELECT DISTINCT d FROM Doctor d
                LEFT JOIN d.profile p
                LEFT JOIN d.clinics c
                WHERE d.onboardingCompleted = true
                AND (CAST(:name AS string) IS NULL OR
                     LOWER(d.firstName) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')) OR
                     LOWER(d.lastName)  LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
                AND (CAST(:specialization AS string) IS NULL OR p.specialization = :specialization)
                AND (:hasClinicFilter = false OR (
                        c.active = true
                        AND (CAST(:city AS string) IS NULL OR LOWER(c.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%')))
                        AND (:maxFees IS NULL OR c.consultationFees <= :maxFees)
                    ))
                ORDER BY d.firstName ASC
            """,
            countQuery = """
                        SELECT COUNT(DISTINCT d) FROM Doctor d
                        LEFT JOIN d.profile p
                        LEFT JOIN d.clinics c
                        WHERE d.onboardingCompleted = true
                        AND (CAST(:name AS string) IS NULL OR
                             LOWER(d.firstName) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')) OR
                             LOWER(d.lastName)  LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
                        AND (CAST(:specialization AS string) IS NULL OR p.specialization = :specialization)
                        AND (:hasClinicFilter = false OR (
                                c.active = true
                                AND (CAST(:city AS string) IS NULL OR LOWER(c.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%')))
                                AND (:maxFees IS NULL OR c.consultationFees <= :maxFees)
                            ))
                    """)
    Page<Doctor> search(
            @Param("name") String name,
            @Param("specialization") Specialization specialization,
            @Param("city") String city,
            @Param("maxFees") BigDecimal maxFees,
            @Param("hasClinicFilter") boolean hasClinicFilter,
            Pageable pageable
    );

    List<Doctor> findByAccountStatus(AccountStatus accountStatus);
}