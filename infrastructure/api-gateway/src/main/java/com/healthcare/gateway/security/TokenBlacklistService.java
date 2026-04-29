package com.healthcare.gateway.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final ReactiveStringRedisTemplate redisTemplate;

    private static final String BLACKLIST_PREFIX = "blacklist:";

    /**
     * Check if a token (by JTI) is blacklisted
     *
     * @param jti the JWT ID of the token to check
     * @return {@code Mono<true>} if blacklisted, {@code  Mono<false>} otherwise
     */
    public Mono<Boolean> isBlacklisted(String jti) {
        return redisTemplate.hasKey(BLACKLIST_PREFIX + jti);
    }
}