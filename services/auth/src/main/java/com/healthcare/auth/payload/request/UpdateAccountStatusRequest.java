package com.healthcare.auth.payload.request;

import com.healthcare.auth.enums.AccountStatus;

public record UpdateAccountStatusRequest(
        String userId,
        AccountStatus newStatus
) {
}
