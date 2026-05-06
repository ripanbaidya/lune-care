package com.healthcare.doctor.service.impl;

import com.healthcare.doctor.client.AuthServiceClient;
import com.healthcare.doctor.entity.Clinic;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorProfile;
import com.healthcare.doctor.enums.AccountStatus;
import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.enums.Specialization;
import com.healthcare.doctor.exception.CloudinaryException;
import com.healthcare.doctor.exception.DoctorException;
import com.healthcare.doctor.mapper.DoctorMapper;
import com.healthcare.doctor.payload.dto.auth.UpdateAccountStatusRequest;
import com.healthcare.doctor.payload.request.CreateDoctorProfileRequest;
import com.healthcare.doctor.payload.request.OnboardingRequest;
import com.healthcare.doctor.payload.request.UpdateDoctorProfileRequest;
import com.healthcare.doctor.payload.request.UpdateVerificationStatusRequest;
import com.healthcare.doctor.payload.response.DoctorProfileResponse;
import com.healthcare.doctor.payload.response.DoctorPublicResponse;
import com.healthcare.doctor.payload.response.DoctorSummaryResponse;
import com.healthcare.doctor.repository.ClinicRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.doctor.service.CloudinaryService;
import com.healthcare.doctor.service.DoctorService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final ClinicRepository clinicRepository;

    private final CloudinaryService cloudinaryService;

    private final AuthServiceClient authServiceClient;

    @Override
    @Transactional
    public void creteProfile(CreateDoctorProfileRequest request) {
        String userId = request.userId();
        log.info("Creating doctor profile. userId={}", userId);

        if (doctorRepository.existsByUserId(userId)) {
            log.error("Doctor already exists. userId={}", userId);
            throw new DoctorException(ErrorCode.DOCTOR_ALREADY_EXISTS);
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(request.userId());
        doctor.setFirstName(request.firstName());
        doctor.setLastName(request.lastName());
        doctor.setPhoneNumber(request.phoneNumber());

        DoctorProfile profile = new DoctorProfile();
        profile.setDoctor(doctor);
        doctor.setProfile(profile);

        doctorRepository.saveAndFlush(doctor);
        log.debug("Doctor profile created. userId={}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(String userId) {
        log.debug("Fetching doctor profile. userId={}", userId);
        return DoctorMapper.toProfileResponse(findByUserId(userId));
    }

    @Override
    @Transactional
    public DoctorProfileResponse completeOnboarding(String userId, OnboardingRequest request) {
        log.info("Completing onboarding. userId={}, specialization={}", userId, request.specialization());

        Doctor doctor = findByUserId(userId);

        if (doctor.getAccountStatus() == AccountStatus.ACTIVE) {
            log.warn("Onboarding rejected — already completed. userId={}", userId);
            throw new DoctorException(ErrorCode.ONBOARDING_ALREADY_COMPLETED);
        }

        try {
            DoctorProfile profile = doctor.getProfile();
            profile.setEmail(request.email());
            profile.setGender(request.gender());
            profile.setDateOfBirth(request.dateOfBirth());
            profile.setSpecialization(request.specialization());
            profile.setQualification(request.qualification());
            profile.setYearsOfExperience(request.yearsOfExperience());
            profile.setBio(request.bio());
            profile.setLanguagesSpoken(request.languagesSpoken());

            // NOTE: Auto-activating for dev. For production, set PENDING_VERIFICATION
            // and await admin approval before setting ACTIVE.
            // doctor.setAccountStatus(AccountStatus.ACTIVE); // DEV
            doctor.setAccountStatus(AccountStatus.PENDING_VERIFICATION); // PROD
            doctor.setOnboardingCompleted(true);

            doctorRepository.save(doctor);

            // syncStatusWithAuthService(userId, AccountStatus.ACTIVE); // DEV
            syncStatusWithAuthService(userId, AccountStatus.PENDING_VERIFICATION); // PROD
            log.info("[DEV] Doctor auto-activated after onboarding. userId={}", userId);

            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Onboarding failed. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateProfile(String userId, UpdateDoctorProfileRequest request) {
        log.debug("Updating profile. userId={}", userId);

        Doctor doctor = findByUserId(userId);
        DoctorProfile profile = doctor.getProfile();

        try {
            if (StringUtils.hasText(request.firstName())) doctor.setFirstName(request.firstName());
            if (StringUtils.hasText(request.lastName())) doctor.setLastName(request.lastName());
            if (StringUtils.hasText(request.email())) profile.setEmail(request.email());

            if (request.gender() != null) profile.setGender(request.gender());
            if (request.dateOfBirth() != null) profile.setDateOfBirth(request.dateOfBirth());
            if (request.specialization() != null) profile.setSpecialization(request.specialization());
            if (StringUtils.hasText(request.qualification())) profile.setQualification(request.qualification());
            if (request.yearsOfExperience() != null) profile.setYearsOfExperience(request.yearsOfExperience());
            if (StringUtils.hasText(request.bio())) profile.setBio(request.bio());
            if (request.languagesSpoken() != null && !request.languagesSpoken().isEmpty())
                profile.setLanguagesSpoken(request.languagesSpoken());

            doctorRepository.save(doctor);

            log.info("Doctor profile updated. userId={}, doctorId={}", userId, doctor.getId());
            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Profile update failed. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorProfileResponse uploadProfilePhoto(String userId, MultipartFile file) {
        log.debug("Uploading profile photo. userId={}, size={} bytes", userId, file.getSize());

        Doctor doctor = findByUserId(userId);
        long startTime = System.currentTimeMillis();

        try {
            Map<String, String> cloudinaryResponse = cloudinaryService.uploadPhoto(doctor.getId(), file);

            doctor.setProfilePhotoUrl(cloudinaryResponse.get("url"));
            doctor.setCloudinaryPublicId(cloudinaryResponse.get("public_id"));
            doctorRepository.save(doctor);

            log.info("Profile photo uploaded. userId={}, publicId={}, duration={}ms",
                    userId, cloudinaryResponse.get("public_id"), System.currentTimeMillis() - startTime);

            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Photo upload failed. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorProfileResponse removeProfilePhoto(String userId) {
        log.info("Removing profile photo. userId={}", userId);

        Doctor doctor = findByUserId(userId);
        String publicId = doctor.getCloudinaryPublicId();

        if (publicId == null) {
            log.warn("Photo removal skipped — no photo exists. userId={}", userId);
            throw new DoctorException(ErrorCode.DOCTOR_PROFILE_PHOTO_NOT_FOUND);
        }

        try {
            cloudinaryService.deletePhoto(publicId);
            doctor.setProfilePhotoUrl(null);
            doctor.setCloudinaryPublicId(null);
            doctorRepository.save(doctor);

            log.info("Profile photo removed. userId={}, deletedPublicId={}", userId, publicId);
            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Photo deletion failed. userId={}, publicId={}, error={}", userId, publicId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_DELETION_FAILED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorPublicResponse> search(String name, String specialization,
                                             String city, BigDecimal maxFees,
                                             int page, int size) {
        log.info("Doctor search. name={}, spec={}, city={}, maxFees={}, page={}, size={}",
                name, specialization, city, maxFees, page, size);

        Specialization spec = null;
        if (StringUtils.hasText(specialization)) {
            try {
                spec = Specialization.valueOf(specialization.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid specialization ignored. value={}", specialization);
            }
        }

        String nameParam = StringUtils.hasText(name) ? name.trim() : null;
        String cityParam = StringUtils.hasText(city) ? city.trim() : null;
        boolean hasClinicFilter = cityParam != null || maxFees != null;

        Pageable pageable = PageRequest.of(page, size);
        long startTime = System.currentTimeMillis();

        try {
            Page<Doctor> doctorPage = doctorRepository.search(
                    nameParam, spec, cityParam, maxFees, hasClinicFilter, pageable);

            if (doctorPage.isEmpty()) {
                log.debug("No doctors found — returning empty page.");
                return Page.empty(pageable);
            }

            // Clinics are already filtered by the SQL JOIN — load them per doctor
            List<String> doctorIds = doctorPage.getContent().stream().map(Doctor::getId).toList();
            List<Clinic> clinics = clinicRepository.findByDoctorIdsAndFilters(doctorIds, cityParam, maxFees);
            Map<String, List<Clinic>> clinicsByDoctorId = clinics.stream()
                    .collect(Collectors.groupingBy(c -> c.getDoctor().getId()));

            List<DoctorPublicResponse> responses = doctorPage.getContent().stream()
                    .map(doctor -> DoctorMapper.toPublicResponse(
                            doctor,
                            clinicsByDoctorId.getOrDefault(doctor.getId(), List.of())
                    ))
                    .toList();

            log.info("Search complete. results={}, total={}, duration={}ms",
                    responses.size(), doctorPage.getTotalElements(),
                    System.currentTimeMillis() - startTime);

            return new PageImpl<>(responses, pageable, doctorPage.getTotalElements());

        } catch (Exception e) {
            log.error("Search failed. name={}, city={}, error={}", name, city, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorPublicResponse getPublicProfile(String doctorId) {
        log.debug("Fetching public profile. doctorId={}", doctorId);

        long startTime = System.currentTimeMillis();

        try {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> {
                        log.warn("Public profile not found. doctorId={}", doctorId);
                        return new DoctorException(ErrorCode.DOCTOR_NOT_FOUND);
                    });

            List<Clinic> clinics = clinicRepository.findByDoctorIdAndActiveTrue(doctor.getId());

            log.info("Public profile retrieved. doctorId={}, clinicCount={}, duration={}ms",
                    doctorId, clinics.size(), System.currentTimeMillis() - startTime);

            return DoctorMapper.toPublicResponse(doctor, clinics);

        } catch (DoctorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to retrieve public profile. doctorId={}, error={}", doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Doctor findByUserId(String userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorException(ErrorCode.DOCTOR_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorSummaryResponse> getDoctorsPendingVerification() {
        log.debug("Fetching pending-verification doctors");
        return doctorRepository.findByAccountStatus(AccountStatus.PENDING_VERIFICATION)
                .stream()
                .map(DoctorMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional
    public void updateVerificationStatus(String doctorId, UpdateVerificationStatusRequest request) {
        boolean approved = request.approved();
        String action = approved ? "APPROVED" : "REJECTED";

        log.info("Verification status update. doctorId={}, action={}", doctorId, action);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorException(ErrorCode.DOCTOR_NOT_FOUND));

        AccountStatus previousStatus = doctor.getAccountStatus();
        AccountStatus newStatus = approved ? AccountStatus.ACTIVE : AccountStatus.ONBOARDING;

        doctor.setOnboardingCompleted(approved);
        doctor.setDocumentVerified(approved);
        doctor.setAccountStatus(newStatus);
        doctorRepository.save(doctor);

        syncStatusWithAuthService(doctor.getUserId(), newStatus);

        log.info("Verification processed. doctorId={}, action={}, {} → {}, documentVerified={}",
                doctorId, action, previousStatus, newStatus, approved);
    }

    // Private helpers

    /**
     * Calls auth-service to sync account status.
     * Circuit breaker will Open after 50% failure in 10 calls and stays open for the 30s,
     * then half-open with 3 probe calls.
     * Retry Up to 3 attempts with 500ms wait on network errors.
     * For the {@code DoctorException} we won't retry — domain errors don't retry.
     * Fallback {@code throws DoctorException(REMOTE_SERVICE_FAILURE)} so the transaction rolls back and
     * the caller gets a 500. Status sync is critical — we must NOT silently succeed if auth-service can't
     * be reached after all retries.
     */
    @CircuitBreaker(name = "auth-service", fallbackMethod = "syncStatusWithAuthServiceFallback")
    @Retry(name = "auth-service")
    private void syncStatusWithAuthService(String userId, AccountStatus newStatus) {
        log.debug("Syncing account status with auth-service. userId={}, status={}", userId, newStatus);
        authServiceClient.updateStatus(new UpdateAccountStatusRequest(userId, newStatus));
        log.info("Auth-service sync successful. userId={}, status={}", userId, newStatus);
    }

    /**
     * Fallback for syncStatusWithAuthService — called when CB is open OR all retries are exhausted.
     * This is a critical operation — we throw to roll back the transaction.
     */
    @SuppressWarnings("unused")
    protected void syncStatusWithAuthServiceFallback(String userId, AccountStatus newStatus, Exception e) {
        log.error("CIRCUIT OPEN / RETRIES EXHAUSTED: auth-service unreachable. " +
                "userId={}, targetStatus={}, error={}", userId, newStatus, e.getMessage());
        throw new DoctorException(ErrorCode.REMOTE_SERVICE_FAILURE,
                "Unable to sync account status with auth-service. Please try again later.");
    }
}