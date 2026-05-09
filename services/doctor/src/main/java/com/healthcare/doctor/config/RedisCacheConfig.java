package com.healthcare.doctor.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class RedisCacheConfig implements CachingConfigurer {

    public static final String DOCTOR_SEARCH_CACHE = "doctor-search";
    public static final String DOCTOR_PUBLIC_PROFILE_CACHE = "doctor-public-profile";

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.findAndRegisterModules();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .computePrefixWith(cacheName -> "v2::" + cacheName + "::")
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        configs.put(DOCTOR_SEARCH_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(5)));
        configs.put(DOCTOR_PUBLIC_PROFILE_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configs)
                .build();
    }

    @Bean
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                log.warn("Cache GET failed. cache={}, key={}, reason={}", cache.getName(), key, exception.getMessage());
                try {
                    cache.evict(key);
                } catch (Exception ignored) {
                    // no-op
                }
            }

            @Override
            public void handleCachePutError(RuntimeException exception, org.springframework.cache.Cache cache, Object key, Object value) {
                log.warn("Cache PUT failed. cache={}, key={}, reason={}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                log.warn("Cache EVICT failed. cache={}, key={}, reason={}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, org.springframework.cache.Cache cache) {
                log.warn("Cache CLEAR failed. cache={}, reason={}", cache.getName(), exception.getMessage());
            }
        };
    }

    @Bean("doctorSearchKeyGenerator")
    public KeyGenerator doctorSearchKeyGenerator() {
        return (target, method, params) -> {
            String name = normalize((String) params[0]);
            String specialization = normalize((String) params[1]);
            String city = normalize((String) params[2]);
            BigDecimal maxFees = (BigDecimal) params[3];
            int page = (Integer) params[4];
            int size = (Integer) params[5];

            String maxFeesToken = maxFees == null ? "null" : maxFees.stripTrailingZeros().toPlainString();

            return String.join("|",
                    "name=" + name,
                    "spec=" + specialization,
                    "city=" + city,
                    "maxFees=" + maxFeesToken,
                    "page=" + page,
                    "size=" + size
            );
        };
    }

    private String normalize(String value) {
        if (value == null) return "null";
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return "null";
        return trimmed.toLowerCase();
    }
}
