package com.healthcare.patient.payload.dto.doctor;

import org.springframework.cloud.openfeign.SpringQueryMap;

import java.math.BigDecimal;

/**
 * DTO for doctor search functionality.
 * Contains filter criteria for searching doctors including name, specialization,
 * location, and fee constraints.<br>
 * Used with {@link SpringQueryMap} to automatically map query parameters to object fields.
 */
public record DoctorSearchRequest(
        String name,
        String specialization,
        String city,
        BigDecimal maxFees
) {
}