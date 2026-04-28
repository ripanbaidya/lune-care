package com.healthcare.doctor.payload.request;

import jakarta.validation.constraints.NotNull;

public record UpdateVerificationStatusRequest(

        @NotNull
        boolean approved,

        /*
         * Required only when code approved = false
         * If admin want's to reject the doctor, then he/she can provide the reason.
         */
        String rejectionReason

) {
}