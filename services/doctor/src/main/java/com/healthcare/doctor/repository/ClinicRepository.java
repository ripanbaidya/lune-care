package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, String> {

    List<Clinic> findByDoctorIdAndActiveTrue(String doctorId);

    Optional<Clinic> findByIdAndDoctorId(String clinicId, String doctorId);

    @Query("""
                SELECT c FROM Clinic c
                WHERE c.active = true
                AND c.doctor.id IN :doctorIds
                AND (CAST(:city AS string) IS NULL OR
                     LOWER(c.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%')))
                AND (:maxFees IS NULL OR c.consultationFees <= :maxFees)
            """)
    List<Clinic> findByDoctorIdsAndFilters(
            @Param("doctorIds") List<String> doctorIds,
            @Param("city") String city,
            @Param("maxFees") BigDecimal maxFees
    );
}