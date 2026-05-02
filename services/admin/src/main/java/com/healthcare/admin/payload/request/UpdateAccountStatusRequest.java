package com.healthcare.admin.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        name = "UpdateAccountStatusRequest",
        description = "Request payload used to update the status of a user account by admin"
)
public record UpdateAccountStatusRequest(

        @Schema(
                description = "Unique identifier of the user whose account status needs to be updated",
                example = "user-12345"
        )
        String userId,

        @Schema(
                description = "New status to be assigned to the user account",
                example = "SUSPENDED",
                allowableValues = {"ACTIVE", "SUSPENDED", "DEACTIVATED"}
        )
        String newStatus

) {
}