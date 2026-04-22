package com.healthcare.patient.payload.response;

import lombok.Builder;

@Builder
public record AddressResponse(
        String addressLine,
        String city,
        String state,
        String pinCode,
        String country
) {
}