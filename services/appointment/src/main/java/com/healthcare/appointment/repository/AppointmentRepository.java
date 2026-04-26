package com.healthcare.appointment.repository;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    /**
     * Patient views their history
     *
     * @param patientId the id of the patient
     * @param pageable  pagination
     * @return list of appointments
     */
    Page<Appointment> findByPatientIdOrderByAppointmentDateDesc(String patientId, Pageable pageable);

    /**
     * Doctor views today's appointments
     *
     * @param doctorId      id of the doctor
     * @param date          date of the appointment
     * @param excludeStatus exclude appointments with this status
     * @return list of appointments
     */
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNotOrderByStartTimeAsc(
            String doctorId, LocalDate date, AppointmentStatus excludeStatus);

    /**
     * Doctor views full history
     *
     * @param doctorId id of the doctor
     * @param pageable pagination
     * @return list of appointments
     */
    Page<Appointment> findByDoctorIdOrderByAppointmentDateDesc(String doctorId, Pageable pageable);

    /**
     * Find appointment by slot — ensures one appointment per slot
     *
     * @param slotId id of the slot
     * @return appointment
     */
    Optional<Appointment> findBySlotId(String slotId);

    /**
     * SAGA compensation - find timed-out pending payment appointments
     * fetch appointments stuck in PENDING_PAYMENT beyond the timeout window
     *
     * @param timeout timeout window
     * @return list of appointments
     */
    @Query("""
            SELECT a FROM Appointment a WHERE a.status = 'PENDING_PAYMENT'
            AND a.createdAt < :timeout"""
    )
    List<Appointment> findTimedOutPendingAppointments(
            @Param("timeout") Instant timeout
    );
}