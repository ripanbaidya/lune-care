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
        log.info("Creating address for userId: {}", userId);
        Patient patient = findByUserId(userId);

        if (patient.getAddress() != null) {
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

        log.info("Address created successfully for userId: {}", userId);
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String userId, AddressRequest request) {
        log.info("Updating address for userId: {}", userId);
        Patient patient = findByUserId(userId);

        Address address = patient.getAddress();
        if (address == null) {
            throw new AddressException(ErrorCode.VALIDATION_FAILED, "No address found for this patient");
        }

        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPincode(request.pinCode());
        address.setCountry(request.country());

        address = addressRepository.save(address);

        log.info("Address updated successfully for userId: {}", userId);
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddress(String userId) {
        log.info("Retrieving address for userId: {}", userId);
        Patient patient = findByUserId(userId);

        Address address = patient.getAddress();
        if (address == null) {
            throw new AddressException(ErrorCode.VALIDATION_FAILED, "No address found for this patient");
        }

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
            log.info("Address deleted successfully for userId: {}", userId);
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