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
import com.healthcare.doctor.payload.response.DoctorProfileResponse;
import com.healthcare.doctor.payload.response.DoctorPublicResponse;
import com.healthcare.doctor.repository.ClinicRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.doctor.service.CloudinaryService;
import com.healthcare.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.ReactiveUserDetailsPasswordService;
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
        if (doctorRepository.existsByUserId(request.userId())) {
            log.error("Patient already exist with with the userId: {}", request.userId());
            throw new DoctorException(ErrorCode.DOCTOR_ALREADY_EXISTS);
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(request.userId());
        doctor.setFirstName(request.firstName());
        doctor.setLastName(request.lastName());
        doctor.setPhoneNumber(request.phoneNumber());

        // Create Doctor profile at the time of creating the doctor
        // profile fields are populated later during the onboarding
        DoctorProfile profile = new DoctorProfile();
        profile.setDoctor(doctor);

        doctor.setProfile(profile);
        doctorRepository.saveAndFlush(doctor);
        log.debug("Doctor profile created successfully for userId: {}", doctor.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(String userId) {
        Doctor doctor = findByUserId(userId);

        return DoctorMapper.toProfileResponse(doctor);
    }

    @Override
    @Transactional
    public DoctorProfileResponse completeOnboarding(String userId, OnboardingRequest request) {
        Doctor doctor = findByUserId(userId);

        if (doctor.isOnboardingCompleted()) {
            throw new DoctorException(ErrorCode.ONBOARDING_ALREADY_COMPLETED);
        }

        DoctorProfile profile = doctor.getProfile();
        profile.setEmail(request.email());
        profile.setGender(request.gender());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setSpecialization(request.specialization());
        profile.setQualification(request.qualification());
        profile.setYearsOfExperience(request.yearsOfExperience());
        profile.setBio(request.bio());
        profile.setLanguagesSpoken(request.languagesSpoken());

        // Mark onboarding complete and activate account
        doctor.setOnboardingCompleted(true);
        doctorRepository.save(doctor);

        // Notify auth-service to flip status from ONBOARDING to ACTIVE
        try {
            var updateAccountStatusRequest = new UpdateAccountStatusRequest(userId, AccountStatus.ACTIVE);
            authServiceClient.updateStatus(updateAccountStatusRequest);

            log.info("Doctor account activated for userId: {}", userId);
        } catch (Exception e) {
            log.error("Failed to update status in auth-service for userId: {}. Error: {}",
                    userId, e.getMessage());
        }

        return DoctorMapper.toProfileResponse(doctor);
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateProfile(String userId, UpdateDoctorProfileRequest request) {
        Doctor doctor = findByUserId(userId);
        DoctorProfile profile = doctor.getProfile();

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
        // I never saved the doctor profile, since the cascade type is all

        return DoctorMapper.toProfileResponse(doctor);
    }

    @Override
    @Transactional
    public DoctorProfileResponse uploadProfilePhoto(String userId, MultipartFile file) {
        Doctor doctor = findByUserId(userId);

        /*
         * Upload patient's profile picture to Cloudinary. If the patient already has a
         * profile photo,
         * Cloudinary will automatically overwrite it using the patient ID as the public_id
         */
        Map<String, String> cloudinaryResponse = cloudinaryService.uploadPhoto(doctor.getId(), file);

        doctor.setProfilePhotoUrl(cloudinaryResponse.get("url"));
        doctor.setCloudinaryPublicId(cloudinaryResponse.get("public_id"));

        doctorRepository.save(doctor);
        log.info("Profile photo uploaded for doctor with userId: {}", userId);

        return DoctorMapper.toProfileResponse(doctor);
    }

    @Override
    @Transactional
    public DoctorProfileResponse removeProfilePhoto(String userId) {
        Doctor doctor = findByUserId(userId);

        if (doctor.getCloudinaryPublicId() == null) {
            throw new DoctorException(ErrorCode.DOCTOR_PROFILE_PHOTO_NOT_FOUND);
        }

        try {
            cloudinaryService.deletePhoto(doctor.getCloudinaryPublicId());
        } catch (CloudinaryException e) {
            throw new CloudinaryException(ErrorCode.PHOTO_DELETION_FAILED);
        }

        doctor.setProfilePhotoUrl(null);
        doctor.setCloudinaryPublicId(null);

        doctorRepository.save(doctor);
        log.info("Profile photo removed for doctor with userId: {}", userId);

        return DoctorMapper.toProfileResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorPublicResponse> search(String name, String specialization,
                                             String city, BigDecimal maxFees,
                                             int page, int size) {
        Specialization spec = null;
        if (StringUtils.hasText(specialization)) {
            try {
                spec = Specialization.valueOf(specialization.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String nameParam = StringUtils.hasText(name) ? name.trim() : null;
        String cityParam = StringUtils.hasText(city) ? city.trim() : null;
        boolean hasClinicFilter = cityParam != null || maxFees != null;

        Pageable pageable = PageRequest.of(page, size);

        // Fetch doctors matching names and specialization
        Page<Doctor> doctorPage = doctorRepository.search(nameParam, spec, pageable);
        if (doctorPage.isEmpty()) {
            return Page.empty();
        }

        List<String> doctorIds = doctorPage.getContent().stream().map(Doctor::getId).toList();

        // Fetch clinics matching city and max fees
        List<Clinic> clinics = clinicRepository.findByDoctorIdsAndFilters(doctorIds, cityParam, maxFees);

        // Group clinics by doctor doctorId
        Map<String, List<Clinic>> clinicsByDoctorId = clinics.stream()
                .collect(Collectors.groupingBy(c -> c.getDoctor().getId()));


        // If clinic-level filters are active, exclude doctors with no matching clinics
        return doctorPage.map(doctor -> {
            List<Clinic> doctorClinics = clinicsByDoctorId.getOrDefault(doctor.getId(), List.of());

            // If clinic filters were applied and this doctor has no matching clinics, skip
            if (hasClinicFilter && doctorClinics.isEmpty()) {
                return null;
            }

            return DoctorMapper.toPublicResponse(doctor, doctorClinics);
        }).map(response -> response); // nulls will still be in the page
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorPublicResponse getPublicProfile(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorException(ErrorCode.DOCTOR_NOT_FOUND));

        List<Clinic> clinics = clinicRepository.findByDoctorIdAndActiveTrue(doctor.getId());
        return DoctorMapper.toPublicResponse(doctor, clinics);
    }

    @Override
    public Doctor findByUserId(String userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorException(ErrorCode.DOCTOR_NOT_FOUND));
    }
}
