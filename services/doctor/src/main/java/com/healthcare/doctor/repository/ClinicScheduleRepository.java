package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.ClinicSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicScheduleRepository extends JpaRepository<ClinicSchedule, String> {

    List<ClinicSchedule> findByClinicId(String clinicId);

    void deleteByClinicId(String clinicId);
}