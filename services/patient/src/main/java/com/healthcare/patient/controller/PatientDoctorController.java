package com.healthcare.patient.controller;

import com.healthcare.patient.client.DoctorServiceClient;
import com.healthcare.patient.payload.dto.doctor.DoctorPublicResponse;
import com.healthcare.patient.payload.dto.doctor.DoctorSearchRequest;
import com.healthcare.patient.payload.dto.success.ResponseWrapper;
import com.healthcare.patient.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(
        name = "Patient Doctor Controller",
        description = "Endpoints for patient-doctor interactions"
)
@RestController
@RequestMapping("/api/patient/doctors")
@RequiredArgsConstructor
public class PatientDoctorController {

    private final DoctorServiceClient doctorServiceClient;

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<List<DoctorPublicResponse>>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal maxFees
    ) {
        var searchRequest = new DoctorSearchRequest(name, specialization, city, maxFees);
        var response = doctorServiceClient.search(searchRequest);

        return ResponseUtil.ok("Doctor list fetched successfully", response);
    }

    @GetMapping("/{doctorId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<DoctorPublicResponse>> getDoctorProfile(
            @PathVariable String doctorId
    ) {
        var response = doctorServiceClient.getDoctorPublicProfile(doctorId);

        return ResponseUtil.ok("Doctor profile fetched successfully", response);
    }
}