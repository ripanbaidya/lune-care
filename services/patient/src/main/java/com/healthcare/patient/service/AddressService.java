package com.healthcare.patient.service;

import com.healthcare.patient.payload.request.AddressRequest;
import com.healthcare.patient.payload.response.AddressResponse;

public interface AddressService {

    AddressResponse createAddress(String userId, AddressRequest request);

    AddressResponse updateAddress(String userId, AddressRequest request);

    AddressResponse getAddress(String userId);

    void deleteAddress(String userId);
}
