package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {

    Optional<DoctorProfile> findByDoctorId(String doctorId);
}