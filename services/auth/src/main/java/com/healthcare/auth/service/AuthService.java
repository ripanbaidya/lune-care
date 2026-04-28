package com.healthcare.auth.service;

import com.healthcare.auth.payload.request.DoctorRegisterRequest;
import com.healthcare.auth.payload.request.LoginRequest;
import com.healthcare.auth.payload.request.PatientRegisterRequest;
import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.response.TokenResponse;

public interface AuthService {

    AuthResponse registerPatient(PatientRegisterRequest request);

    AuthResponse registerDoctor(DoctorRegisterRequest request);

    AuthResponse login(LoginRequest request);

    /**
     * Issues a fresh access token and refresh token pair in exchange for a valid,
     * non-revoked refresh token. The old refresh token is rotated (revoked) as
     * part of this operation.
     *
     * @param refreshToken the refresh token string (raw JWT, no Bearer prefix)
     * @return a new {@link TokenResponse} containing both tokens and the new TTL
     */
    TokenResponse refreshToken(String refreshToken);

    /**
     * Revokes the user's refresh token and blacklists the access token in Redis so it
     * cannot be reused before its natural expiry.
     *
     * @param accessToken  the current access token (raw JWT or Bearer-prefixed)
     * @param refreshToken the refresh token to revoke in the database
     */
    void logout(String accessToken, String refreshToken);

}
