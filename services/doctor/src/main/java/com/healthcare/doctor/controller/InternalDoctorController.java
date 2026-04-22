package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.request.CreateDoctorProfileRequest;
import com.healthcare.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/doctor")
@RequiredArgsConstructor
public class InternalDoctorController {

    private final DoctorService doctorService;

    @PostMapping("/create-profile")
    public ResponseEntity<Void> createProfile(
            @Valid @RequestBody CreateDoctorProfileRequest request
    ) {
        doctorService.creteProfile(request);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
