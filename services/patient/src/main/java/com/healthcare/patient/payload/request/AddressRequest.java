package com.healthcare.patient.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for creating or updating patient address")
public record AddressRequest(

        @Schema(description = "Street address line", example = "42, Park Street")
        String addressLine,

        @Schema(description = "City", example = "Kolkata")
        String city,

        @Schema(description = "State", example = "West Bengal")
        String state,

        @Schema(description = "PIN code", example = "700016")
        String pinCode,

        @Schema(description = "Country", example = "India")
        String country
) {
}