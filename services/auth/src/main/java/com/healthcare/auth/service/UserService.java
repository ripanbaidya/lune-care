package com.healthcare.auth.service;

import com.healthcare.auth.enums.AccountStatus;
import com.healthcare.auth.enums.Role;
import com.healthcare.auth.payload.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getUser(String userId);

    int countUsersByRole(Role role);

    /**
     * Called by other services like - doctor or admin via internal Feign clients to
     * update account status after onboarding or suspension decisions.
     *
     * @param userId    the user whose status should change
     * @param newStatus the target {@link AccountStatus}
     */
    void updateUserStatus(String userId, AccountStatus newStatus);
}
