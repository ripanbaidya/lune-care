package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.request.CreateDoctorProfileRequest;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/internal/doctor")
@RequiredArgsConstructor
public class InternalDoctorController {

    private final DoctorService doctorService;
    private final ClinicService clinicService;

    @PostMapping("/create-profile")
    public ResponseEntity<Void> createProfile(
            @Valid @RequestBody CreateDoctorProfileRequest request
    ) {
        doctorService.creteProfile(request);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/clinics/{clinicId}/fees")
    public ResponseEntity<BigDecimal> getClinicFees(@PathVariable String clinicId) {
        return ResponseEntity.ok(clinicService.getClinicFees(clinicId));
    }
}
