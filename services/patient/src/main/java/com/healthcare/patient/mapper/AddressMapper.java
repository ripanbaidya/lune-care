package com.healthcare.patient.mapper;

import com.healthcare.patient.entity.Address;
import com.healthcare.patient.payload.response.AddressResponse;

public final class AddressMapper {

    private AddressMapper() {
    }

    public static AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .pinCode(address.getPincode())
                .country(address.getCountry())
                .build();
    }
}
