package com.healthcare.auth.service;

import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.request.LoginRequest;
import com.healthcare.auth.payload.response.TokenResponse;
import com.healthcare.auth.payload.request.DoctorRegisterRequest;
import com.healthcare.auth.payload.request.PatientRegisterRequest;
import com.healthcare.auth.enums.AccountStatus;

public interface AuthService {

    AuthResponse registerPatient(PatientRegisterRequest request);

    AuthResponse registerDoctor(DoctorRegisterRequest request);

    AuthResponse login(LoginRequest request);

    void updateUserStatus(String userId, AccountStatus newStatus);

    TokenResponse refreshToken(String refreshToken);

    void logout(String accessToken, String refreshToken);
}
