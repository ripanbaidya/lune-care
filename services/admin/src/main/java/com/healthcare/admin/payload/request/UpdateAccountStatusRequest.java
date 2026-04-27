package com.healthcare.admin.payload.request;

public record UpdateAccountStatusRequest(
        String userId,
        String newStatus
) {
}