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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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

    /**
     * Onboarding Step 1: Create Doctor Profile
     * Used by {@code auth-service} to create a new doctor profile.
     *
     * @param request the request object containing user details
     */
    @Override
    @Transactional
    public void creteProfile(CreateDoctorProfileRequest request) {
        String userId = request.userId();
        log.info("Creating doctor profile for userId: {}", userId);

        if (doctorRepository.existsByUserId(userId)) {
            log.error("Doctor already exist with with the userId: {}", userId);
            throw new DoctorException(ErrorCode.DOCTOR_ALREADY_EXISTS);
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(request.userId());
        doctor.setFirstName(request.firstName());
        doctor.setLastName(request.lastName());
        doctor.setPhoneNumber(request.phoneNumber());

        // Create Doctor profile at the time of creating the Doctor
        DoctorProfile profile = new DoctorProfile();
        profile.setDoctor(doctor);

        doctor.setProfile(profile);
        doctorRepository.saveAndFlush(doctor);
        log.debug("Doctor profile created successfully for userId: {}", doctor.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(String userId) {
        log.debug("Fetching doctor profile for userId: {}", userId);

        Doctor doctor = findByUserId(userId);
        return DoctorMapper.toProfileResponse(doctor);
    }

    /**
     * Onboarding Step 2: Profile Completion
     */
    @Override
    @Transactional
    public DoctorProfileResponse completeOnboarding(String userId, OnboardingRequest request) {
        log.info("Starting onboarding completion. userId={}, specialization={}", userId, request.specialization());

        Doctor doctor = findByUserId(userId);

        if (doctor.isOnboardingCompleted()) {
            log.warn("Onboarding rejected: Already completed or Document Verified. userId={}", userId);
            throw new DoctorException(ErrorCode.ONBOARDING_ALREADY_COMPLETED);
        }

        try {
            // Update doctor profile
            DoctorProfile profile = doctor.getProfile();
            profile.setEmail(request.email());
            profile.setGender(request.gender());
            profile.setDateOfBirth(request.dateOfBirth());
            profile.setSpecialization(request.specialization());
            profile.setQualification(request.qualification());
            profile.setYearsOfExperience(request.yearsOfExperience());
            profile.setBio(request.bio());
            profile.setLanguagesSpoken(request.languagesSpoken());

            // Note: We are making the profile active immediately after profile details are submitted.
            // We are not waiting for Document Verification. But the frontend will have the complete flow
            // TODO: Remove this auto-activation and implement full verification flow before production.
            doctor.setAccountStatus(AccountStatus.ACTIVE);
            doctor.setOnboardingCompleted(true);

            doctorRepository.save(doctor);
            log.debug("Local doctor profile updated and marked as complete. userId={}", userId);

            syncStatusWithAuthService(userId, AccountStatus.ACTIVE);
            log.debug("[DEV-MODE] Onboarding step completed. Doctor account auto-activated for development. userId={}, doctorId={}",
                    userId, doctor.getId());

            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Onboarding failed for userId={}. Reason: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateProfile(String userId, UpdateDoctorProfileRequest request) {
        log.debug("Update profile request received. userId={}", userId);

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

            // Since you rely on Cascading, this save triggers a multi-table update
            doctorRepository.save(doctor);

            log.info("Doctor profile updated successfully. userId={}, doctorId={}", userId, doctor.getId());

            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Failed to update doctor profile. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorProfileResponse uploadProfilePhoto(String userId, MultipartFile file) {
        log.debug("Starting profile photo upload. userId={}, fileName={}, size={} bytes, type={}",
                userId, file.getOriginalFilename(), file.getSize(), file.getContentType());

        Doctor doctor = findByUserId(userId);
        long startTime = System.currentTimeMillis();

        try {
            log.debug("Calling Cloudinary for patientId={}", doctor.getId());
            Map<String, String> cloudinaryResponse = cloudinaryService.uploadPhoto(doctor.getId(), file);

            long duration = System.currentTimeMillis() - startTime;

            // Capture the URL and PublicID returned to ensure the handshake worked
            log.info("Photo uploaded to Cloudinary. userId={}, publicId={}, duration={}ms",
                    userId, cloudinaryResponse.get("public_id"), duration);

            doctor.setProfilePhotoUrl(cloudinaryResponse.get("url"));
            doctor.setCloudinaryPublicId(cloudinaryResponse.get("public_id"));

            doctorRepository.save(doctor);

            log.debug("Database updated with new photo URL. userId={}", userId);

            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Failed doctor photo upload. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorProfileResponse removeProfilePhoto(String userId) {
        log.info("Request to remove doctor profile photo. userId={}", userId);

        Doctor doctor = findByUserId(userId);
        String publicId = doctor.getCloudinaryPublicId();

        if (publicId == null) {
            log.warn("Photo removal skipped: No photo exists for doctor. userId={}", userId);
            throw new DoctorException(ErrorCode.DOCTOR_PROFILE_PHOTO_NOT_FOUND);
        }

        try {
            log.debug("Deleting photo from Cloudinary. publicId={}", publicId);
            cloudinaryService.deletePhoto(publicId);

            doctor.setProfilePhotoUrl(null);
            doctor.setCloudinaryPublicId(null);
            doctorRepository.save(doctor);

            log.info("Doctor profile photo removed successfully. userId={}, deletedPublicId={}", userId, publicId);
            return DoctorMapper.toProfileResponse(doctor);

        } catch (Exception e) {
            log.error("Failed to delete doctor photo from cloud. userId={}, publicId={}, error={}",
                    userId, publicId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_DELETION_FAILED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorPublicResponse> search(String name, String specialization,
                                             String city, BigDecimal maxFees,
                                             int page, int size) {
        log.info("Doctor search initiated. name={}, spec={}, city={}, maxFees={}, page={}, size={}",
                name, specialization, city, maxFees, page, size);

        Specialization spec = null;
        if (StringUtils.hasText(specialization)) {
            try {
                spec = Specialization.valueOf(specialization.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid specialization provided: {}. Ignoring filter.", specialization);
            }
        }

        String nameParam = StringUtils.hasText(name) ? name.trim() : null;
        String cityParam = StringUtils.hasText(city) ? city.trim() : null;
        boolean hasClinicFilter = cityParam != null || maxFees != null;

        Pageable pageable = PageRequest.of(page, size);
        long startTime = System.currentTimeMillis();

        try {
            Page<Doctor> doctorPage = doctorRepository.search(nameParam, spec, pageable);
            if (doctorPage.isEmpty()) {
                log.debug("No doctors found matching primary criteria. Returning empty page.");
                return Page.empty();
            }

            List<String> doctorIds = doctorPage.getContent().stream().map(Doctor::getId).toList();

            log.debug("Fetching clinics for {} doctors. city={}, maxFees={}", doctorIds.size(), cityParam, maxFees);
            List<Clinic> clinics = clinicRepository.findByDoctorIdsAndFilters(doctorIds, cityParam, maxFees);

            Map<String, List<Clinic>> clinicsByDoctorId = clinics.stream()
                    .collect(Collectors.groupingBy(c -> c.getDoctor().getId()));

            Page<DoctorPublicResponse> responsePage = doctorPage.map(doctor -> {
                List<Clinic> doctorClinics = clinicsByDoctorId.getOrDefault(doctor.getId(), List.of());

                // Note: If hasClinicFilter is true, the doctorRepository.search()
                // should ideally handle the Join to avoid pagination issues.
                if (hasClinicFilter && doctorClinics.isEmpty()) {
                    return null;
                }
                return DoctorMapper.toPublicResponse(doctor, doctorClinics);
            });

            long duration = System.currentTimeMillis() - startTime;
            log.info("Search completed. resultsOnPage={}, totalResults={}, duration={}ms",
                    responsePage.getNumberOfElements(), responsePage.getTotalElements(), duration);

            return responsePage;

        } catch (Exception e) {
            log.error("Search failed. Criteria: name={}, city={}, error={}", name, city, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorPublicResponse getPublicProfile(String doctorId) {
        log.debug("Fetching public profile for doctorId: {}", doctorId);

        long startTime = System.currentTimeMillis();

        try {
            // Fetch doctor or throw error if missing
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> {
                        log.warn("Public profile lookup failed: Doctor not found. doctorId={}", doctorId);
                        return new DoctorException(ErrorCode.DOCTOR_NOT_FOUND);
                    });

            // Fetch associated clinics
            List<Clinic> clinics = clinicRepository.findByDoctorIdAndActiveTrue(doctor.getId());

            long duration = System.currentTimeMillis() - startTime;

            log.info("Public profile retrieved. doctorId={}, clinicCount={}, duration={}ms",
                    doctorId, clinics.size(), duration);

            return DoctorMapper.toPublicResponse(doctor, clinics);

        } catch (DoctorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error retrieving public profile. doctorId={}, error={}",
                    doctorId, e.getMessage(), e);
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
        log.debug("Fetching pending verification doctors");
        return doctorRepository.findByAccountStatus(AccountStatus.PENDING_VERIFICATION)
                .stream()
                .map(DoctorMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional
    public void updateVerificationStatus(String doctorId, UpdateVerificationStatusRequest request) {
        final boolean approved = request.approved();
        final String action = approved ? "APPROVED" : "REJECTED";

        log.info("Doctor verification request received: doctorId={}, action={}", doctorId, action);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorException(ErrorCode.DOCTOR_NOT_FOUND));

        AccountStatus previousStatus = doctor.getAccountStatus();
        AccountStatus newStatus = approved
                ? AccountStatus.ACTIVE
                : AccountStatus.PENDING_VERIFICATION;

        syncStatusWithAuthService(doctor.getUserId(), newStatus);

        // Update doctor state
        doctor.setDocumentVerified(approved);
        doctor.setAccountStatus(newStatus);

        doctorRepository.save(doctor);

        log.info("Doctor verification processed: doctorId={}, action={}, previousStatus={}, newStatus={}, documentVerified={}",
                doctorId, action, previousStatus, newStatus, approved);
    }

    private void syncStatusWithAuthService(String userId, AccountStatus newStatus) {
        try {
            log.debug("Synchronizing account status with auth-service. userId={}, status={}", userId, newStatus);
            var updateRequest = new UpdateAccountStatusRequest(userId, newStatus);
            authServiceClient.updateStatus(updateRequest);
            log.info("Auth-service status synchronized. userId={}, status={}", userId, newStatus);
        } catch (Exception e) {
            log.error("Auth-service status sync failed. userId={}, status={}, error={}",
                    userId, newStatus, e.getMessage());
            throw new DoctorException(ErrorCode.REMOTE_SERVICE_FAILURE);
        }
    }
}
