package com.healthcare.auth.service.impl;

import com.healthcare.auth.entity.User;
import com.healthcare.auth.enums.AccountStatus;
import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.enums.Role;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.payload.response.UserProfileResponse;
import com.healthcare.auth.respository.UserRepository;
import com.healthcare.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUser(String userId) {
        return userRepository.findById(userId)
                .map(UserProfileResponse::from)
                .orElseThrow(() -> {
                    log.warn("User not found for userId='{}'", userId);
                    return new AuthException(ErrorCode.USER_NOT_FOUND);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public int countUsersByRole(Role role) {
        return userRepository.countByRole(role);
    }

    /**
     * <p>Called by other services like - {@code doctor, admin} via Feign clients
     */
    @Override
    @Transactional
    public void updateUserStatus(String userId, AccountStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("Status update failed — no user found for userId='{}'.", userId);
                    return new AuthException(ErrorCode.USER_NOT_FOUND);
                });

        AccountStatus previous = user.getAccountStatus();
        user.setAccountStatus(newStatus);
        userRepository.save(user);

        log.info("Account status updated — userId='{}', {} -> {}.", userId, previous, newStatus);
    }
}
