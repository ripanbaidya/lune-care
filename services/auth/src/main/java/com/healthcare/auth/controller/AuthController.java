package com.healthcare.auth.controller;

import com.healthcare.auth.payload.dto.success.ResponseWrapper;
import com.healthcare.auth.payload.request.DoctorRegisterRequest;
import com.healthcare.auth.payload.request.LoginRequest;
import com.healthcare.auth.payload.request.PatientRegisterRequest;
import com.healthcare.auth.payload.request.RefreshTokenRequest;
import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.response.TokenResponse;
import com.healthcare.auth.service.AuthService;
import com.healthcare.auth.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication", description = "Endpoints for user authentication")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "400", description = "Validation failed — invalid request body",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Register a new patient",
            description = "Creates a new patient account and returns auth tokens"
    )
    @ApiResponse(responseCode = "201", description = "Patient registered successfully")
    @PostMapping("/register/patient")
    public ResponseEntity<ResponseWrapper<AuthResponse>> registerPatient(
            @Valid @RequestBody PatientRegisterRequest request
    ) {
        var response = authService.registerPatient(request);
        return ResponseUtil.created("Patient Registered Successfully", response);
    }

    @Operation(
            summary = "Register a new doctor",
            description = "Creates a new doctor account and returns auth tokens"
    )
    @ApiResponse(responseCode = "201", description = "Doctor registered successfully")
    @PostMapping("/register/doctor")
    public ResponseEntity<ResponseWrapper<AuthResponse>> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequest request
    ) {
        var response = authService.registerDoctor(request);
        return ResponseUtil.created("Doctor Registered Successfully", response);
    }

    @Operation(
            summary = "Login",
            description = "Authenticates user by phone number and password, returns JWT tokens"
    )
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    @PostMapping("/login")
    public ResponseEntity<ResponseWrapper<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        var response = authService.login(request);
        return ResponseUtil.ok("Login Successful", response);
    }

    @Operation(
            summary = "Refresh access token",
            description = "Issues a new access token using a valid refresh token"
    )
    @ApiResponse(responseCode = "200", description = "Token refreshed successfully")
    @ApiResponse(responseCode = "401", description = "Refresh token is expired or invalid")
    @PostMapping("/refresh")
    public ResponseEntity<ResponseWrapper<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        var response = authService.refreshToken(request.refreshToken());
        return ResponseUtil.ok("Token refreshed successfully", response);
    }
}