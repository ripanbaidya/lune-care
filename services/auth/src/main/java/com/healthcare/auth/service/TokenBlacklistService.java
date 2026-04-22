package com.healthcare.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    /**
     * Prefix used for storing blacklisted tokens in Redis.
     * <p>Key format: {@code blacklist:<jti>}
     */
    private static final String BLACKLISTED_PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;

    /**
     * Add token to blacklist with an expiration time equal to the remaining validity of
     * the token.
     * This ensures that blacklisted tokens are automatically removed from Redis after they
     * expire, preventing unbounded growth of the blacklist.
     *
     * @param jti                       the token's jti (JWT ID)
     * @param remainingValidityInMillis the remaining validity time of the token in milliseconds
     */
    public void blacklist(String jti, long remainingValidityInMillis) {
        if (remainingValidityInMillis <= 0) {
            log.debug("Token already expired, skipping blacklist. jti: {}", jti);
            return;
        }

        String key = BLACKLISTED_PREFIX + jti;
        redisTemplate.opsForValue().set(key, "1", Duration.ofMillis(remainingValidityInMillis));
        log.info("Token blacklisted with jti: {}, expires in {} ms", jti, remainingValidityInMillis);
    }

    /**
     * Called by gateway on every request, it Checks if token is blacklisted
     *
     * @param jti the token's jti (JWT ID)
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLISTED_PREFIX + jti));
    }
}