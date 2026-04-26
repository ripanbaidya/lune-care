package com.healthcare.payment.repository;

import com.healthcare.payment.entity.PaymentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentRecord, String> {

    Optional<PaymentRecord> findByAppointmentId(String appointmentId);

    boolean existsByAppointmentId(String appointmentId);

    Page<PaymentRecord> findByPatientIdOrderByCreatedAtDesc(String patientId, Pageable pageable);

    Optional<PaymentRecord> findByRazorpayOrderId(String razorpayOrderId);
}