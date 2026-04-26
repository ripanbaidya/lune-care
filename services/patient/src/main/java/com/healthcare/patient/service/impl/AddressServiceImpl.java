package com.healthcare.patient.service.impl;

import com.healthcare.patient.entity.Address;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.enums.ErrorCode;
import com.healthcare.patient.exception.AddressException;
import com.healthcare.patient.exception.PatientException;
import com.healthcare.patient.mapper.AddressMapper;
import com.healthcare.patient.payload.request.AddressRequest;
import com.healthcare.patient.payload.response.AddressResponse;
import com.healthcare.patient.repository.AddressRepository;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public AddressResponse createAddress(String userId, AddressRequest request) {
        log.debug("Creating address for userId='{}'", userId);
        Patient patient = findByUserId(userId);

        if (patient.getAddress() != null) {
            log.warn("Address creation failed: userId={} already has an existing address", userId);
            throw new AddressException(ErrorCode.VALIDATION_FAILED, "Address already exists for this patient");
        }

        Address address = new Address();
        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPincode(request.pinCode());
        address.setCountry(request.country());

        patient.setAddress(address);
        patientRepository.save(patient);

        log.info("Successfully created address. userId={}, city={}, state={}",
                userId, address.getCity(), address.getState());
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String userId, AddressRequest request) {
        log.debug("Updating address for userId='{}'", userId);

        Patient patient = findByUserId(userId);
        Address address = patient.getAddress();

        if (address == null) {
            log.warn("Address update failed: userId={} does not have an existing address", userId);
            throw new AddressException(ErrorCode.VALIDATION_FAILED, "No address found for this patient");
        }

        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPincode(request.pinCode());
        address.setCountry(request.country());

        address = addressRepository.save(address);

        log.debug("Successfully updated address. userId={}, city={}, state={}",
                userId, address.getCity(), address.getState());
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddress(String userId) {
        log.debug("Retrieving address for userId={}", userId);

        Patient patient = findByUserId(userId);
        Address address = patient.getAddress();

        if (address == null) {
            log.warn("Address retrieval failed: userId={} does not have an existing address", userId);
            throw new AddressException(ErrorCode.VALIDATION_FAILED, "No address found for this patient");
        }

        log.debug("Address fetched successfully. userId={}", userId);
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(String userId) {
        log.info("Deleting address for userId: {}", userId);
        Patient patient = findByUserId(userId);

        if (patient.getAddress() != null) {
            patient.setAddress(null);
            patientRepository.save(patient);
            log.debug("Address deleted successfully for userId: {}", userId);
        } else {
            log.warn("No address to delete for userId: {}", userId);
        }
    }

    /*
     * Helper
     */

    private Patient findByUserId(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientException(ErrorCode.PATIENT_NOT_FOUND));
    }
}