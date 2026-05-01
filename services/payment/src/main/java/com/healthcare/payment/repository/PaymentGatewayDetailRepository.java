package com.healthcare.payment.repository;

import com.healthcare.payment.entity.PaymentGatewayDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentGatewayDetailRepository extends JpaRepository<PaymentGatewayDetail, String> {
}