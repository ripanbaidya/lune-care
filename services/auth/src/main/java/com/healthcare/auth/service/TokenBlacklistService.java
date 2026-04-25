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
     * Redis key prefix for blacklisted tokens, key format: {@code blacklist:<jti>}
     */
    private static final String BLACKLIST_PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;

    /**
     * Adds an access token's JTI to the Redis blacklist.
     * <p>TTL is set to the token's remaining validity so that Redis automatically evicts
     * the entry once the token would be expired anyway — this prevents unbounded growth
     * of the blacklist without a separate cleanup job.
     * <p>If the token is already expired ({@code remainingValidityInMillis <= 0}),
     * blacklisting is skipped because the token is harmless.
     *
     * @param jti                       the {@code jti} claim from the JWT
     * @param remainingValidityInMillis milliseconds until the token naturally expires
     */
    public void blacklist(String jti, long remainingValidityInMillis) {
        if (remainingValidityInMillis <= 0) {
            log.debug("Skipping blacklist for jti='{}' — token is already expired.", jti);
            return;
        }

        String key = BLACKLIST_PREFIX + jti;
        redisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(remainingValidityInMillis));
        log.info("Access token blacklisted — jti='{}', expires in {}ms.", jti, remainingValidityInMillis);
    }

    /**
     * Checks whether a token's JTI is present in the blacklist.
     * <p>Called by the API Gateway / security filter on every authenticated request.
     * Redis lookup is O(1) and the key auto-expires, so this is safe at high throughput.
     *
     * @param jti the {@code jti} claim extracted from the incoming JWT
     * @return {@code true} if the token has been explicitly revoked, {@code false} otherwise
     */
    public boolean isBlacklisted(String jti) {
        boolean blacklisted = Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + jti));
        if (blacklisted) {
            log.warn("Blacklisted token usage detected — jti='{}'.", jti);
        }
        return blacklisted;
    }
}