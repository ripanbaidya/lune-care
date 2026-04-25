package com.healthcare.auth.schedular;

import com.healthcare.auth.respository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Deletes all revoked and expired refresh tokens from the database.
     * <br>Runs daily at {@code 2.00 AM}
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupInactiveToken() {
        log.info("Starting cleanup of inactive refresh tokens");

        try {
            int deletedCount = refreshTokenRepository.deleteAllInactiveTokens(Instant.now());
            log.info("Successfully cleaned up {} inactive refresh tokens", deletedCount);
        } catch (Exception e) {
            log.error("Error occurred while cleaning up inactive refresh tokens", e);
        }
    }
}
