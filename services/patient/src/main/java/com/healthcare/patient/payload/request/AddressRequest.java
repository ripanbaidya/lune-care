package com.healthcare.patient.payload.request;

public record AddressRequest(
        String addressLine,
        String city,
        String state,
        String pinCode,
        String country
) {
}
