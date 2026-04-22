package com.healthcare.patient.service.impl;

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
    public void creteProfile(CreateProfileRequest request) {
        if (patientRepository.existsByUserId(request.userId())) {
            log.error("Patient already exist with with the userId: {}", request.userId());
            throw new PatientException(ErrorCode.PATIENT_ALREADY_EXISTS);
        }

        Patient patient = new Patient();
        patient.setUserId(request.userId());
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setPhoneNumber(request.phoneNumber());

        patientRepository.saveAndFlush(patient);
        log.debug("Patient profile created successfully for userId: {}", patient.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientProfileResponse getProfile(String userId) {
        Patient patient = findByUserId(userId);

        return PatientMapper.toResponse(patient);
    }

    @Override
    @Transactional
    public PatientProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        Patient patient = findByUserId(userId);

        if (StringUtils.hasText(request.firstName())) patient.setFirstName(request.firstName());
        if (StringUtils.hasText(request.lastName())) patient.setLastName(request.lastName());
        if (StringUtils.hasText(request.email())) patient.setEmail(request.email());

        if (request.dateOfBirth() != null) patient.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null) patient.setGender(request.gender());
        if (request.bloodGroup() != null) patient.setBloodGroup(request.bloodGroup());

        patientRepository.save(patient);

        return PatientMapper.toResponse(patient);
    }

    @Override
    @Transactional
    public PatientProfileResponse uploadProfilePhoto(String userId, MultipartFile file) {
        Patient patient = findByUserId(userId);

        /*
         * Upload patient's profile picture to Cloudinary. If the patient already has a
         * profile photo,
         * Cloudinary will automatically overwrite it using the patient ID as the public_id
         */
        Map<String, String> cloudinaryResponse = cloudinaryService.uploadPhoto(patient.getId(), file);

        patient.setProfilePhotoUrl(cloudinaryResponse.get("url"));
        patient.setCloudinaryPublicId(cloudinaryResponse.get("public_id"));

        patientRepository.save(patient);
        log.info("Profile photo uploaded for patient with userId: {}", userId);

        return PatientMapper.toResponse(patient);
    }

    @Override
    @Transactional
    public PatientProfileResponse removeProfilePhoto(String userId) {
        Patient patient = findByUserId(userId);

        if (patient.getCloudinaryPublicId() == null) {
            throw new PatientException(ErrorCode.PATIENT_PROFILE_PHOTO_NOT_FOUND);
        }

        cloudinaryService.deletePhoto(patient.getCloudinaryPublicId());

        patient.setProfilePhotoUrl(null);
        patient.setCloudinaryPublicId(null);

        patientRepository.save(patient);
        log.info("Profile photo removed for patient with userId: {}", userId);
        
        return PatientMapper.toResponse(patient);
    }

    /*
     * Helpers
     */

    private Patient findByUserId(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientException(ErrorCode.PATIENT_NOT_FOUND));
    }
}
