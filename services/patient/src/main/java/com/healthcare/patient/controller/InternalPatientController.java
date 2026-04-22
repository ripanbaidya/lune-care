package com.healthcare.patient.controller;

import com.healthcare.patient.payload.request.CreateProfileRequest;
import com.healthcare.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/patient")
@RequiredArgsConstructor
public class InternalPatientController {

    private final PatientService patientService;

    @PostMapping("/create-profile")
    public ResponseEntity<Void> createProfile(
            @Valid @RequestBody CreateProfileRequest request
    ) {
        patientService.creteProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
