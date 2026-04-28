package com.healthcare.auth.controller;

import com.healthcare.auth.payload.dto.success.ResponseWrapper;
import com.healthcare.auth.payload.request.*;
import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.response.TokenResponse;
import com.healthcare.auth.service.AuthService;
import com.healthcare.auth.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Authentication",
        description = "Endpoints for user authentication"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/patient")
    public ResponseEntity<ResponseWrapper<AuthResponse>> registerPatient(
            @Valid @RequestBody PatientRegisterRequest request
    ) {
        var response = authService.registerPatient(request);
        return ResponseUtil.created("Patient Registered Successfully", response);
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<ResponseWrapper<AuthResponse>> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequest request
    ) {
        var response = authService.registerDoctor(request);
        return ResponseUtil.created("Doctor Registered Successfully", response);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseWrapper<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        var response = authService.login(request);
        return ResponseUtil.ok("Login Successful", response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ResponseWrapper<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        var response = authService.refreshToken(request.refreshToken());
        return ResponseUtil.ok("Token refreshed successfully", response);
    }

}
