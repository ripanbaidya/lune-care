package com.healthcare.doctor.payload.dto.auth;

import com.healthcare.doctor.enums.AccountStatus;

public record UpdateAccountStatusRequest(
        String userId,
        AccountStatus newStatus
) {
}
