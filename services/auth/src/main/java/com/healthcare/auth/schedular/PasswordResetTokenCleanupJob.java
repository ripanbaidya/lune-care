package com.healthcare.auth.schedular;

import com.healthcare.auth.respository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordResetTokenCleanupJob {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    /**
     * Deletes all used and expired password reset tokens from the database.
     * <br>Runs daily at {@code 2.30 AM}
     */
    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void cleanupInactiveTokens() {
        log.info("Starting cleanup of inactive password reset tokens");

        try {
            int deletedCount = passwordResetTokenRepository.deleteAllInactiveTokens(Instant.now());
            log.info("Successfully cleaned up {} inactive password reset tokens", deletedCount);
        } catch (Exception e) {
            log.error("Error occurred while cleaning up password reset tokens", e);
        }
    }
}
