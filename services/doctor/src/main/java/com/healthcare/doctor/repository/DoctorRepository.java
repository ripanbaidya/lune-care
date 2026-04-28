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

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {

    Optional<Doctor> findByUserId(String userId);

    boolean existsByUserId(String userId);

    @Query("""
                SELECT d FROM Doctor d
                LEFT JOIN d.profile p
                WHERE d.onboardingCompleted = true
                AND (CAST(:name AS string) IS NULL OR
                     LOWER(d.firstName) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')) OR
                     LOWER(d.lastName)  LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
                AND (CAST(:specialization AS string) IS NULL OR p.specialization = :specialization)
                ORDER BY d.firstName ASC
            """)
    Page<Doctor> search(
            @Param("name") String name,
            @Param("specialization") Specialization specialization,
            Pageable pageable
    );

    List<Doctor> findByAccountStatus(AccountStatus accountStatus);
}