package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.ClinicSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicScheduleRepository extends JpaRepository<ClinicSchedule, String> {

    List<ClinicSchedule> findByClinicId(String clinicId);

    Optional<ClinicSchedule> findByClinicIdAndDayOfWeek(String clinicId, DayOfWeek dayOfWeek);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from ClinicSchedule cs where cs.clinic.id= :clinicId")
    void deleteByClinicId(@Param("clinicId") String clinicId);
}