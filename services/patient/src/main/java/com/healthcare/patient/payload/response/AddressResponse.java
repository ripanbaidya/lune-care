package com.healthcare.patient.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "Patient's saved address details")
@Builder
public record AddressResponse(

        @Schema(description = "Street address line")
        String addressLine,

        @Schema(description = "City")
        String city,

        @Schema(description = "State")
        String state,

        @Schema(description = "PIN code")
        String pinCode,

        @Schema(description = "Country")
        String country
) {
}