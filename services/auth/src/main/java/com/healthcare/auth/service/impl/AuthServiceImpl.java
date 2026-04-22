package com.healthcare.auth.service.impl;

import com.healthcare.auth.client.DoctorServiceClient;
import com.healthcare.auth.client.PatientServiceClient;
import com.healthcare.auth.config.properties.JwtSecurityProperties;
import com.healthcare.auth.payload.dto.doctor.CreateDoctorProfileRequest;
import com.healthcare.auth.payload.dto.patient.CreatePatientProfileRequest;
import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.request.LoginRequest;
import com.healthcare.auth.payload.response.TokenResponse;
import com.healthcare.auth.payload.request.DoctorRegisterRequest;
import com.healthcare.auth.payload.request.PatientRegisterRequest;
import com.healthcare.auth.entity.RefreshToken;
import com.healthcare.auth.entity.User;
import com.healthcare.auth.enums.AccountStatus;
import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.enums.Role;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.respository.RefreshTokenRepository;
import com.healthcare.auth.respository.UserRepository;
import com.healthcare.auth.security.JwtService;
import com.healthcare.auth.service.AuthService;
import com.healthcare.auth.service.TokenBlacklistService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtSecurityProperties jwtProperties;

    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public AuthResponse registerPatient(PatientRegisterRequest request) {
        validatePhoneNumberNotTaken(request.phoneNumber());

        // Save Patient Identity to DB
        User user = new User();
        user.setPhoneNumber(request.phoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ROLE_PATIENT);
        user.setAccountStatus(AccountStatus.ACTIVE);

        user = userRepository.save(user);
        log.info("Patient Identity saved to DB with userId: {}", user.getId());

        try {
            // Call the patient service to create the patient profile
            log.info("Creating patient profile for user with userId: {}", user.getId());
            var createPatientProfileRequestData = CreatePatientProfileRequest.builder()
                    .userId(user.getId())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .phoneNumber(request.phoneNumber())
                    .build();

            patientServiceClient.createProfile(createPatientProfileRequestData);
            log.debug("Patient profile created for user with userId: {}", user.getId());

        } catch (FeignException.Conflict e) {
            log.warn("Conflict while creating patient profile for user with id: {}. " +
                    "This may indicate a duplicate profile. Error: {}", user.getId(), e.getMessage());
        } catch (FeignException e) {
            log.error("Failed to create patient profile for userId: {}. Status: {}. Body: {}",
                    user.getId(),
                    e.status(),
                    e.contentUTF8());
        } catch (Exception e) {
            log.error("Unexpected error while creating patient profile for userId: {}. Error: {}",
                    user.getId(), e.getMessage());
        }

        return AuthResponse.of(user, issueTokens(user));
    }

    @Override
    @Transactional
    public AuthResponse registerDoctor(DoctorRegisterRequest request) {
        validatePhoneNumberNotTaken(request.phoneNumber());

        User user = new User();
        user.setPhoneNumber(request.phoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ROLE_DOCTOR);

        // Doctor need to go through the onboarding phase
        // after onboarding is complete his account will activate
        user.setAccountStatus(AccountStatus.ONBOARDING);

        user = userRepository.save(user);
        log.info("Doctor Identity saved to DB with userId: {}", user.getId());

        try {
            // Call the doctor service to create the doctor profile
            log.info("Creating doctor profile for user with userId: {}", user.getId());
            var createDoctorProfileRequestData = CreateDoctorProfileRequest.builder()
                    .userId(user.getId())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .phoneNumber(request.phoneNumber())
                    .build();

            doctorServiceClient.createProfile(createDoctorProfileRequestData);
            log.debug("Doctor profile created for user with userId: {}", user.getId());

        } catch (FeignException.Conflict e) {
            log.warn("Conflict while creating doctor profile for user with id: {}. " +
                    "This may indicate a duplicate profile. Error: {}", user.getId(), e.getMessage());
        } catch (FeignException e) {
            log.error("Failed to create doctor profile for userId: {}. Status: {}. Body: {}",
                    user.getId(),
                    e.status(),
                    e.contentUTF8());
        } catch (Exception e) {
            log.error("Unexpected error while creating doctor profile for userId: {}. Error: {}",
                    user.getId(), e.getMessage());
        }

        return AuthResponse.of(user, issueTokens(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

        // Check whether password matches
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Invalid password attempt for phone number: {}", request.phoneNumber());
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new AuthException(ErrorCode.ACCOUNT_SUSPENDED);
        }

        var tokens = issueTokens(user);

        log.debug("User logged in successfully for id: {}", user.getId());
        return AuthResponse.of(user, tokens);
    }

    /**
     * Internal use only - not exposed via API.
     * Used by doctor-service and admin-service
     *
     * @param userId    ID of the user
     * @param newStatus New account status to set
     */
    @Override
    @Transactional
    public void updateUserStatus(String userId, AccountStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

        user.setAccountStatus(newStatus);
        userRepository.save(user);

        log.debug("User account status updated to {} for user: {}", newStatus, userId);
    }

    @Override
    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        log.debug("Refresh token attempt..");

        // Validate the token structure and signature
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new AuthException(ErrorCode.TOKEN_INVALID);
        }

        // Must be a refresh token — reject access tokens
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new AuthException(ErrorCode.TOKEN_INVALID,
                    "Access tokens cannot be used to refresh sessions");
        }

        // Find in DB
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AuthException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        // Check if already revoked
        if (stored.isRevoked()) {
            log.warn("Revoked refresh token used for user: {}", stored.getUser().getId());
            throw new AuthException(ErrorCode.REFRESH_TOKEN_REVOKED);
        }

        if (stored.isExpired()) {
            log.warn("Expired refresh token used for user: {}", stored.getUser().getId());
            throw new AuthException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        User user = stored.getUser();

        // Note: For refresh token we won't generate new pair (access + refresh)
        // Rather we are generating the access token only, and will send old refresh token
        String newAccessToken = jwtService.generateAccessToken(user);
        long expiresInMillis = jwtProperties.accessToken().expiry();

        log.info("Token refreshed successfully for user: {}", user.getId());
        return TokenResponse.of(newAccessToken, refreshToken, expiresInMillis);
    }

    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AuthException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        if (token.isRevoked()) {
            log.warn("Logout called with already-revoked token for user: {}", token.getUser().getId());
        } else {
            token.revoke(Instant.now());
            refreshTokenRepository.save(token);
        }

        try {
            String jti = jwtService.extractJti(accessToken);
            long remainingMs = jwtService.getRemainingValidityInMillis(accessToken);
            tokenBlacklistService.blacklist(jti, remainingMs);
            log.debug("Added access token to redis blacklist: {}", jti);
        } catch (Exception e) {
            log.warn("Could not blacklist access token during logout: {}", e.getMessage());
        }

        log.info("User logged out successfully: {}", token.getUser().getId());
    }

    /*
     * Helpers
     */

    private void validatePhoneNumberNotTaken(String phoneNumber) {
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new AuthException(ErrorCode.USER_ALREADY_EXISTS);
        }
    }

    private TokenResponse issueTokens(User user) {
        // Revoke existing refresh token if present — one active token per user
        refreshTokenRepository.findActiveByUserId(user.getId(), Instant.now())
                .ifPresent(existing -> {
                    existing.revoke(Instant.now());
                    refreshTokenRepository.save(existing);
                    log.debug("Revoked existing refresh token for user: {}", user.getId());
                });

        // Issue new tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Persist the new refresh token
        Instant now = Instant.now();
        long expiresIn = jwtProperties.accessToken().expiry();

        RefreshToken entity = new RefreshToken();
        entity.setToken(refreshToken);
        entity.setUser(user);
        entity.setCreatedAt(now);
        entity.setExpiresAt(now.plusMillis(expiresIn));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);

        return TokenResponse.of(accessToken, refreshToken, expiresIn);
    }
}
