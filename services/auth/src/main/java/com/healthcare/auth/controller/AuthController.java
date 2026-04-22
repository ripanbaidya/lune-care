package com.healthcare.auth.controller;

import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.response.TokenResponse;
import com.healthcare.auth.payload.request.LoginRequest;
import com.healthcare.auth.payload.request.LogoutRequest;
import com.healthcare.auth.payload.request.RefreshTokenRequest;
import com.healthcare.auth.payload.request.DoctorRegisterRequest;
import com.healthcare.auth.payload.request.PatientRegisterRequest;
import com.healthcare.auth.payload.dto.success.ResponseWrapper;
import com.healthcare.auth.service.AuthService;
import com.healthcare.auth.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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
        return ResponseUtil.created(
                "Patient Registered Successfully",
                authService.registerPatient(request)
        );
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<ResponseWrapper<AuthResponse>> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequest request) {
        return ResponseUtil.created(
                "Doctor Registered Successfully",
                authService.registerDoctor(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseWrapper<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseUtil.ok(
                "Login Successful",
                authService.login(request)
        );
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ResponseWrapper<TokenResponse>> refresh(

            @Valid @RequestBody RefreshTokenRequest request
    ) {
        return ResponseUtil.ok(
                "Token refreshed successfully",
                authService.refreshToken(request.refreshToken())
        );
    }

}
