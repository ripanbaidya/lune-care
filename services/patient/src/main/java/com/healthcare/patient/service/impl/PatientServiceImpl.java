package com.healthcare.patient.service.impl;

import com.healthcare.patient.config.RedisCacheConfig;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.enums.ErrorCode;
import com.healthcare.patient.exception.PatientException;
import com.healthcare.patient.mapper.PatientMapper;
import com.healthcare.patient.payload.request.CreateProfileRequest;
import com.healthcare.patient.payload.request.UpdateProfileRequest;
import com.healthcare.patient.payload.response.PatientProfileResponse;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.service.CloudinaryService;
import com.healthcare.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = RedisCacheConfig.PATIENT_PROFILE_CACHE, key = "#request.userId()"),
            @CacheEvict(cacheNames = RedisCacheConfig.PATIENT_ADDRESS_CACHE, key = "#request.userId()")
    })
    public void creteProfile(CreateProfileRequest request) {
        log.info("Creating patient profile for userId: {}", request.userId());
        String userId = request.userId();

        if (patientRepository.existsByUserId(userId)) {
            log.warn("Patient already exist with the userId: {}", request.userId());
            throw new PatientException(ErrorCode.PATIENT_ALREADY_EXISTS);
        }

        Patient patient = new Patient();
        patient.setUserId(request.userId());
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setPhoneNumber(request.phoneNumber());

        patientRepository.saveAndFlush(patient);
        log.info("Patient profile created successfully for userId: {}", patient.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = RedisCacheConfig.PATIENT_PROFILE_CACHE, key = "#userId")
    public PatientProfileResponse getProfile(String userId) {
        log.debug("Fetching patient profile for userId: {}", userId);

        Patient patient = findByUserId(userId);
        return PatientMapper.toResponse(patient);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = RedisCacheConfig.PATIENT_PROFILE_CACHE, key = "#userId")
    public PatientProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        log.debug("Updating patient profile for userId: {}", userId);
        Patient patient = findByUserId(userId);

        if (StringUtils.hasText(request.firstName())) patient.setFirstName(request.firstName());
        if (StringUtils.hasText(request.lastName())) patient.setLastName(request.lastName());
        if (StringUtils.hasText(request.email())) patient.setEmail(request.email());

        if (request.dateOfBirth() != null) patient.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null) patient.setGender(request.gender());
        if (request.bloodGroup() != null) patient.setBloodGroup(request.bloodGroup());

        patientRepository.save(patient);

        log.debug("Patient profile updated successfully for userId: {}", userId);
        return PatientMapper.toResponse(patient);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = RedisCacheConfig.PATIENT_PROFILE_CACHE, key = "#userId")
    public PatientProfileResponse uploadProfilePhoto(String userId, MultipartFile file) {
        log.debug("Starting profile photo upload. userId={}, fileName={}, size={} bytes, type={}",
                userId, file.getOriginalFilename(), file.getSize(), file.getContentType());

        Patient patient = findByUserId(userId);
        long startTime = System.currentTimeMillis();

        try {
            log.debug("Calling Cloudinary for patientId={}", patient.getId());
            Map<String, String> cloudinaryResponse = cloudinaryService.uploadPhoto(patient.getId(), file);

            long duration = System.currentTimeMillis() - startTime;

            // Capture the URL and PublicID returned to ensure the handshake worked
            log.info("Photo uploaded to Cloudinary. userId={}, publicId={}, duration={}ms",
                    userId, cloudinaryResponse.get("public_id"), duration);

            patient.setProfilePhotoUrl(cloudinaryResponse.get("url"));
            patient.setCloudinaryPublicId(cloudinaryResponse.get("public_id"));

            patientRepository.save(patient);

            log.debug("Database updated with new photo URL. userId={}", userId);

            return PatientMapper.toResponse(patient);

        } catch (Exception e) {
            log.error("Profile photo upload failed. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = RedisCacheConfig.PATIENT_PROFILE_CACHE, key = "#userId")
    public PatientProfileResponse removeProfilePhoto(String userId) {
        log.debug("Request to remove profile photo. userId={}", userId);

        Patient patient = findByUserId(userId);
        String publicId = patient.getCloudinaryPublicId();

        if (publicId == null) {
            log.warn("Photo removal aborted: No photo found for user. userId={}", userId);
            throw new PatientException(ErrorCode.PATIENT_PROFILE_PHOTO_NOT_FOUND);
        }

        try {
            log.debug("Calling Cloudinary to delete photo. userId={}, publicId={}", userId, publicId);
            cloudinaryService.deletePhoto(publicId);

            patient.setProfilePhotoUrl(null);
            patient.setCloudinaryPublicId(null);
            patientRepository.save(patient);

            log.debug("Profile photo successfully removed from cloud and database. userId={}, deletedPublicId={}",
                    userId, publicId);

            return PatientMapper.toResponse(patient);

        } catch (Exception e) {
            log.error("Failed to remove profile photo. userId={}, publicId={}, error={}",
                    userId, publicId, e.getMessage(), e);
            throw e;
        }
    }

    /*
     * Helpers
     */

    private Patient findByUserId(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientException(ErrorCode.PATIENT_NOT_FOUND));
    }
}
