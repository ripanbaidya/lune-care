package com.healthcare.doctor.service.impl;

import com.healthcare.doctor.config.RedisCacheConfig;
import com.healthcare.doctor.entity.Clinic;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.ClinicException;
import com.healthcare.doctor.mapper.ClinicMapper;
import com.healthcare.doctor.payload.request.CreateClinicRequest;
import com.healthcare.doctor.payload.request.UpdateClinicRequest;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.repository.ClinicRepository;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicServiceImpl implements ClinicService {

    private final DoctorService doctorService;

    private final ClinicRepository clinicRepository;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = RedisCacheConfig.DOCTOR_SEARCH_CACHE, allEntries = true),
            @CacheEvict(cacheNames = RedisCacheConfig.DOCTOR_PUBLIC_PROFILE_CACHE, allEntries = true)
    })
    public ClinicResponse addClinic(String userId, CreateClinicRequest request) {
        log.info("Adding new clinic for doctor. userId={}, clinicName={}, city={}",
                userId, request.name(), request.city());

        Doctor doctor = doctorService.findByUserId(userId);
        long startTime = System.currentTimeMillis();

        try {
            Clinic clinic = Clinic.builder()
                    .doctor(doctor)
                    .name(request.name())
                    .type(request.type())
                    .consultationFees(request.consultationFees())
                    .consultationDurationMinutes(request.consultationDurationMinutes())
                    .contactNumber(request.contactNumber())
                    .addressLine(request.addressLine())
                    .city(request.city())
                    .state(request.state())
                    .pincode(request.pincode())
                    .country(request.country() != null ? request.country() : "India")
                    .active(true) // Explicitly set default state
                    .build();

            clinicRepository.save(clinic);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Clinic successfully created. doctorId={}, clinicId={}, name={}, duration={}ms",
                    doctor.getId(), clinic.getId(), clinic.getName(), duration);

            return ClinicMapper.toClinicResponse(clinic);

        } catch (Exception e) {
            log.error("Failed to add clinic for doctor. userId={}, clinicName={}, error={}",
                    userId, request.name(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicResponse> getClinics(String userId) {
        log.debug("Fetching clinics for doctor. userId={}", userId);

        long startTime = System.currentTimeMillis();

        try {
            Doctor doctor = doctorService.findByUserId(userId);

            List<Clinic> clinics = clinicRepository.findByDoctorIdAndActiveTrue(doctor.getId());

            long duration = System.currentTimeMillis() - startTime;

            log.info("Clinics retrieved. userId={}, doctorId={}, count={}, duration={}ms",
                    userId, doctor.getId(), clinics.size(), duration);

            return clinics.stream()
                    .map(ClinicMapper::toClinicResponse)
                    .toList();

        } catch (Exception e) {
            log.error("Failed to retrieve clinics for doctor. userId={}, error={}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getClinicFees(String clinicId) {
        log.trace("Fetching consultation fees. clinicId={}", clinicId);

        return clinicRepository.findById(clinicId)
                .map(clinic -> {
                    BigDecimal fees = clinic.getConsultationFees();

                    // If fees are zero, it might be intentional, but it's worth a debug log
                    if (fees == null || fees.compareTo(BigDecimal.ZERO) == 0) {
                        log.debug("Clinic found but fees are zero/null. clinicId={}", clinicId);
                    }
                    return fees != null ? fees : BigDecimal.ZERO;
                })
                .orElseGet(() -> {
                    // If we hit this, the booking flow is using an ID that doesn't exist
                    log.warn("Fee lookup failed: Clinic not found. clinicId={}. Returning ZERO.", clinicId);
                    return BigDecimal.ZERO;
                });
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = RedisCacheConfig.DOCTOR_SEARCH_CACHE, allEntries = true),
            @CacheEvict(cacheNames = RedisCacheConfig.DOCTOR_PUBLIC_PROFILE_CACHE, allEntries = true)
    })
    public ClinicResponse updateClinic(String userId, String clinicId, UpdateClinicRequest request) {
        log.info("Updating clinic details. userId={}, clinicId={}", userId, clinicId);

        Doctor doctor = doctorService.findByUserId(userId);

        Clinic clinic = findClinicOwnedByDoctor(clinicId, doctor.getId());

        try {
            // Dirty Check Tracing
            log.debug("Current clinic state: name={}, city={}", clinic.getName(), clinic.getCity());

            if (StringUtils.hasText(request.name())) clinic.setName(request.name());
            if (request.type() != null) clinic.setType(request.type());

            if (request.consultationFees() != null) {
                log.debug("Updating fees for clinicId {}: {} -> {}",
                        clinicId, clinic.getConsultationFees(), request.consultationFees());
                clinic.setConsultationFees(request.consultationFees());
            }

            if (request.consultationDurationMinutes() != null)
                clinic.setConsultationDurationMinutes(request.consultationDurationMinutes());

            if (StringUtils.hasText(request.contactNumber())) clinic.setContactNumber(request.contactNumber());
            if (StringUtils.hasText(request.addressLine())) clinic.setAddressLine(request.addressLine());
            if (StringUtils.hasText(request.city())) clinic.setCity(request.city());
            if (StringUtils.hasText(request.state())) clinic.setState(request.state());
            if (StringUtils.hasText(request.pincode())) clinic.setPincode(request.pincode());
            if (StringUtils.hasText(request.country())) clinic.setCountry(request.country());

            clinicRepository.save(clinic);

            log.info("Clinic updated successfully. clinicId={}, doctorId={}, updatedCity={}",
                    clinicId, doctor.getId(), clinic.getCity());

            return ClinicMapper.toClinicResponse(clinic);

        } catch (Exception e) {
            log.error("Failed to update clinic. userId={}, clinicId={}, error={}",
                    userId, clinicId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = RedisCacheConfig.DOCTOR_SEARCH_CACHE, allEntries = true),
            @CacheEvict(cacheNames = RedisCacheConfig.DOCTOR_PUBLIC_PROFILE_CACHE, allEntries = true)
    })
    public void deleteClinic(String userId, String clinicId) {
        log.info("Request to deactivate (soft-delete) clinic. userId={}, clinicId={}", userId, clinicId);

        Doctor doctor = doctorService.findByUserId(userId);

        Clinic clinic = findClinicOwnedByDoctor(clinicId, doctor.getId());

        try {
            // If it's already inactive, we log a warning rather than performing redundant work
            if (!clinic.isActive()) {
                log.warn("Clinic deactivation skipped: Already inactive. clinicId={}", clinicId);
                return;
            }

            clinic.setActive(false);
            clinicRepository.save(clinic);

            log.info("Clinic successfully deactivated. clinicId={}, doctorId={}, name='{}'",
                    clinicId, doctor.getId(), clinic.getName());

        } catch (Exception e) {
            log.error("Failed to deactivate clinic. userId={}, clinicId={}, error={}",
                    userId, clinicId, e.getMessage(), e);
            throw e;
        }
    }

    /*
     * Helper methods
     */

    private Clinic findClinicOwnedByDoctor(String clinicId, String doctorId) {
        return clinicRepository.findByIdAndDoctorId(clinicId, doctorId)
                .orElseThrow(() -> new ClinicException(ErrorCode.CLINIC_NOT_FOUND,
                        "Clinic not found or does not belong to this doctor: " + clinicId));
    }
}
