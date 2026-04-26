package com.healthcare.appointment.repository;

import com.healthcare.appointment.entity.Slot;
import com.healthcare.appointment.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotRepository extends JpaRepository<Slot, String> {

    List<Slot> findByDoctorIdAndClinicIdAndSlotDateAndStatusOrderByStartTimeAsc(
            String doctorId,
            String clinicId,
            LocalDate slotDate,
            SlotStatus status
    );

    boolean existsByDoctorIdAndClinicIdAndSlotDateAndStartTime(
            String doctorId,
            String clinicId,
            LocalDate slotDate,
            LocalTime startTime
    );


    List<Slot> findByDoctorIdAndClinicIdAndSlotDateBetween(
            String doctorId,
            String clinicId,
            LocalDate from,
            LocalDate to
    );

    Optional<Slot> findByIdAndStatus(String id, SlotStatus status);

    List<Slot> findByClinicIdAndSlotDateBetweenAndStatus(
            String clinicId,
            LocalDate from,
            LocalDate to,
            SlotStatus status
    );

    /**
     * Bulk cancel available slots for a clinic - when a clinic is deactivated
     *
     * @param clinicId the id of the clinic
     * @param fromDate the start date of the slot range to cancel
     */
    @Modifying
    @Query("""
            update Slot s
            set s.status = 'CANCELLED' where s.clinicId = :clinicId
            and s.status = 'AVAILABLE' AND s.slotDate >= :fromDate
            """)
    int cancelAvailableSlotsForClinic(
            @Param("clinicId") String clinicId,
            @Param("fromDate") LocalDate fromDate
    );

    @Modifying
    @Query(value = """
            update slots
            set status = 'CANCELLED'
            where clinic_id = :clinicId
            and status = 'AVAILABLE'
            and slot_date >= :fromDate
            and extract(isodow from slot_date) = :isoDow
            """, nativeQuery = true)
    int cancelAvailableSlotsForClinicAndDay(
            @Param("clinicId") String clinicId,
            @Param("fromDate") LocalDate fromDate,
            @Param("isoDow") int isoDow // 1=Monday, 2=Tuesday ... 7=Sunday (ISO standard)
    );
}