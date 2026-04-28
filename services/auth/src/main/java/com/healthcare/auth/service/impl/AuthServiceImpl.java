package com.healthcare.auth.service.impl;

import com.healthcare.auth.client.DoctorServiceClient;
import com.healthcare.auth.client.PatientServiceClient;
import com.healthcare.auth.config.properties.JwtSecurityProperties;
import com.healthcare.auth.entity.RefreshToken;
import com.healthcare.auth.entity.User;
import com.healthcare.auth.enums.AccountStatus;
import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.enums.Role;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.payload.dto.doctor.CreateDoctorProfileRequest;
import com.healthcare.auth.payload.dto.patient.CreatePatientProfileRequest;
import com.healthcare.auth.payload.request.DoctorRegisterRequest;
import com.healthcare.auth.payload.request.LoginRequest;
import com.healthcare.auth.payload.request.PatientRegisterRequest;
import com.healthcare.auth.payload.response.AuthResponse;
import com.healthcare.auth.payload.response.TokenResponse;
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

import static com.healthcare.auth.util.MaskingUtil.maskPhoneNumber;

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
        String phoneNumber = request.phoneNumber();
        log.info("Registering patient with phoneNumber='{}'", maskPhoneNumber(phoneNumber));

        validatePhoneNumberNotTaken(request.phoneNumber());

        User user = new User();
        user.setPhoneNumber(request.phoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ROLE_PATIENT);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user = userRepository.save(user);

        log.info("Patient identity persisted — userId='{}'.", user.getId());
        createPatientProfile(user, request);

        TokenResponse tokens = issueTokenPair(user);
        log.info("Patient registered and tokens issued — userId='{}'.", user.getId());
        return AuthResponse.of(user, tokens);
    }

    @Override
    @Transactional
    public AuthResponse registerDoctor(DoctorRegisterRequest request) {
        String phoneNumber = request.phoneNumber();
        log.info("Registering doctor with phoneNumber='{}'", maskPhoneNumber(phoneNumber));

        validatePhoneNumberNotTaken(request.phoneNumber());

        User user = new User();
        user.setPhoneNumber(request.phoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ROLE_DOCTOR);
        // Doctors begin in ONBOARDING; account activates after profile verification.
        user.setAccountStatus(AccountStatus.ONBOARDING);
        user = userRepository.save(user);

        log.info("Doctor identity persisted — userId='{}'.", user.getId());
        createDoctorProfile(user, request);

        TokenResponse tokens = issueTokenPair(user);
        log.info("Doctor registered and tokens issued — userId='{}'.", user.getId());
        return AuthResponse.of(user, tokens);
    }

    /**
     * Login an existing user.
     */
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String phoneNumber = request.phoneNumber();

        User user = userRepository.findByPhoneNumber(request.phoneNumber()).orElseThrow(
                () -> {
                    log.warn("Login failed. no account found for phoneNumber={}", maskPhoneNumber(phoneNumber));
                    return new AuthException(ErrorCode.USER_NOT_FOUND);
                }
        );

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Login failed. incorrect password for userId={}", user.getId());
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            log.warn("Login blocked — account is suspended for userId={}", user.getId());
            throw new AuthException(ErrorCode.ACCOUNT_SUSPENDED);
        }

        TokenResponse tokens = issueTokenPair(user);
        log.info("Login successful — userId='{}', role='{}'.", user.getId(), user.getRole());
        return AuthResponse.of(user, tokens);
    }

    /**
     * Exchanges a valid refresh token for a fresh (accessToken + refreshToken) pair.
     * <p><b>Token Rotation</b>: the incoming refresh token is revoked and a brand-new
     * refresh token is persisted. This limits the damage window if a refresh token
     * is ever leaked — replaying a rotated token will be detected immediately.
     *
     * <p>This endpoint is intentionally public (no access token required).
     * The refresh token itself is the credential for this operation.
     */
    @Override
    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        log.debug("Refresh token exchange initiated.");

        // Validate structure & RSA signature
        if (!jwtService.isTokenValid(refreshToken)) {
            log.warn("Refresh token exchange rejected — token failed JWT validation.");
            throw new AuthException(ErrorCode.TOKEN_INVALID,
                    "The provided refresh token is invalid or has been tampered with.");
        }

        //Ensure the caller is not accidentally passing an access token
        if (!jwtService.isRefreshToken(refreshToken)) {
            log.warn("Refresh token exchange rejected — access token was passed instead of refresh token.");
            throw new AuthException(ErrorCode.TOKEN_INVALID,
                    "An access token cannot be used to refresh a session. Please provide a refresh token.");
        }

        // Verify the token exists in the database
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken).orElseThrow(
                () -> {
                    log.warn("Refresh token exchange rejected — token not found in database.");
                    return new AuthException(ErrorCode.REFRESH_TOKEN_NOT_FOUND,
                            "Refresh token not recognised. Please log in again.");
                }
        );

        // Reject if already revoked (possible replay attack)
        if (stored.isRevoked()) {
            log.warn("Refresh token exchange rejected — token already revoked. " +
                    "Possible replay attack for userId='{}'.", stored.getUser().getId());
            throw new AuthException(ErrorCode.REFRESH_TOKEN_REVOKED,
                    "This refresh token has already been used or revoked. Please log in again.");
        }

        // Reject if expired per database record
        if (stored.isExpired()) {
            log.warn("Refresh token exchange rejected — token expired in DB for userId='{}'.",
                    stored.getUser().getId());
            throw new AuthException(ErrorCode.REFRESH_TOKEN_EXPIRED,
                    "Your session has expired. Please log in again.");
        }

        // Rotate: revoke the old token and issue a completely fresh pair
        stored.revoke(Instant.now());
        refreshTokenRepository.save(stored);
        log.debug("Old refresh token rotated (revoked) for userId='{}'.", stored.getUser().getId());

        TokenResponse newTokens = issueTokenPair(stored.getUser());

        log.info("Token pair refreshed successfully — userId='{}'.", stored.getUser().getId());
        return newTokens;
    }

    /**
     * Performs a full logout by:
     * <ol>
     *   <li>Revoking the refresh token in the database.</li>
     *   <li>Blacklisting the access token in Redis until its natural expiry.</li>
     * </ol>
     * Both tokens must be provided. A missing or already-revoked refresh token
     * is treated as an error to prevent silent partial logouts.
     */
    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        // Revoke refresh token in DB
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken).orElseThrow(
                () -> {
                    log.warn("Logout failed — refresh token not found in database.");
                    return new AuthException(ErrorCode.REFRESH_TOKEN_NOT_FOUND,
                            "Refresh token not recognised.");
                }
        );

        if (stored.isRevoked()) {
            // Log but do not fail — idempotent logout is safe UX
            log.warn("Logout called with an already-revoked refresh token for userId='{}'." +
                    " Proceeding to blacklist access token anyway.", stored.getUser().getId());
        } else {
            stored.revoke(Instant.now());
            refreshTokenRepository.save(stored);
            log.debug("Refresh token revoked for userId='{}'.", stored.getUser().getId());
        }

        // Blacklist access token in Redis
        try {
            String jti = jwtService.extractJti(accessToken);
            long remainingMs = jwtService.getRemainingValidityInMillis(accessToken);
            tokenBlacklistService.blacklist(jti, remainingMs);
        } catch (Exception ex) {
            // Non-fatal: the refresh token is already revoked, so the user is
            // effectively logged out. The access token will expire naturally.
            log.warn("Could not blacklist access token during logout — it will expire on its own. " +
                    "userId='{}', reason: {}.", stored.getUser().getId(), ex.getMessage());
        }

        log.info("Logout successful — userId='{}'.", stored.getUser().getId());
    }

    /*
     * Private Helpers
     */

    /**
     * Issues a fresh (accessToken + refreshToken) pair for the given user.
     * <p>Any existing active refresh token for the user is revoked first so that only one
     * valid refresh token exists at any point in time (single-session enforcement).
     * The new refresh token is persisted to the database with the correct TTL from
     * {@code jwtProperties.refreshToken().expiry()}.
     */
    private TokenResponse issueTokenPair(User user) {
        // Revoke any existing active refresh token — enforce single active session
        refreshTokenRepository.findActiveByUserId(user.getId(), Instant.now()).ifPresent(
                existing -> {
                    existing.revoke(Instant.now());
                    refreshTokenRepository.save(existing);
                    log.debug("Revoked previous active refresh token for userId='{}'.", user.getId());
                });

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Instant now = Instant.now();
        long refreshExpiryMillis = jwtProperties.refreshToken().expiry();
        long accessExpiryMillis = jwtProperties.accessToken().expiry();

        RefreshToken entity = new RefreshToken();
        entity.setToken(refreshToken);
        entity.setUser(user);
        entity.setCreatedAt(now);
        entity.setExpiresAt(now.plusMillis(refreshExpiryMillis));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);

        log.debug("Token pair issued — userId='{}', refreshTokenExpiresAt='{}'.",
                user.getId(), entity.getExpiresAt());

        return TokenResponse.of(accessToken, refreshToken, accessExpiryMillis);
    }

    private void validatePhoneNumberNotTaken(String phoneNumber) {
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            log.warn("Registration rejected — phoneNumber already registered: '{}'.", maskPhoneNumber(phoneNumber));
            throw new AuthException(ErrorCode.USER_ALREADY_EXISTS,
                    "An account with this phone number already exists.");
        }
    }

    /**
     * Calls the {@code patient-service} to create the patient's profile record.
     * Profile creation failure is non-fatal for registration:
     * the identity is already saved, and the profile can be created via a
     * retry or reconciliation job. All failures are logged for alerting.
     */
    private void createPatientProfile(User user, PatientRegisterRequest request) {
        try {
            var profileRequest = CreatePatientProfileRequest.builder()
                    .userId(user.getId())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .phoneNumber(request.phoneNumber())
                    .build();
            patientServiceClient.createProfile(profileRequest);
            log.debug("Patient profile created via patient-service — userId='{}'.", user.getId());

        } catch (FeignException.Conflict ex) {
            log.warn("Patient profile already exists in patient-service — userId='{}'. " +
                    "This may be a duplicate registration attempt. Skipping.", user.getId());
        } catch (FeignException ex) {
            log.error("patient-service returned HTTP {} while creating profile for userId='{}'. " +
                            "Body: {}. Identity is saved; profile creation will need manual reconciliation.",
                    ex.status(), user.getId(), ex.contentUTF8());
        } catch (Exception ex) {
            log.error("Unexpected error calling patient-service for userId='{}': {}. " +
                            "Identity is saved; profile creation will need manual reconciliation.",
                    user.getId(), ex.getMessage());
        }
    }

    /**
     * Calls the {@code doctor-service} to create the doctor's profile record.
     * See {@link #createPatientProfile} for the error-handling rationale.
     */
    private void createDoctorProfile(User user, DoctorRegisterRequest request) {
        try {
            var profileRequest = CreateDoctorProfileRequest.builder()
                    .userId(user.getId())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .phoneNumber(request.phoneNumber())
                    .build();
            doctorServiceClient.createProfile(profileRequest);
            log.debug("Doctor profile created via doctor-service — userId='{}'.", user.getId());

        } catch (FeignException.Conflict ex) {
            log.warn("Doctor profile already exists in doctor-service — userId='{}'. " +
                    "This may be a duplicate registration attempt. Skipping.", user.getId());
        } catch (FeignException ex) {
            log.error("doctor-service returned HTTP {} while creating profile for userId='{}'. " +
                            "Body: {}. Identity is saved; profile creation will need manual reconciliation.",
                    ex.status(), user.getId(), ex.contentUTF8());
        } catch (Exception ex) {
            log.error("Unexpected error calling doctor-service for userId='{}': {}. " +
                            "Identity is saved; profile creation will need manual reconciliation.",
                    user.getId(), ex.getMessage());
        }
    }
}