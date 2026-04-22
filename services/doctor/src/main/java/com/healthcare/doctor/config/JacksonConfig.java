package com.healthcare.doctor.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static com.fasterxml.jackson.databind.cfg.CoercionAction.AsNull;
import static com.fasterxml.jackson.databind.cfg.CoercionInputShape.EmptyString;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        /*
         * Handle empty string ("") for Enum fields.
         * Problem:Frontend sometimes sends "" instead of null for enums.
         * Default Jackson behavior → throws InvalidFormatException.
         * Solution: Treat "" as null instead of failing.
         * Note: Validation (@NotNull) should still be used to enforce required fields.
         */
        mapper.coercionConfigFor(Enum.class).setCoercion(EmptyString, AsNull);

        /*
         * Ignore unknown JSON properties during deserialization.
         * If client sends extra/unexpected fields → API fails by default.
         * Ignore unknown fields for better backward/forward compatibility.
         */
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        /*
         * Use ISO-8601 format for date/time instead of timestamps.
         * Default: Dates serialized as numeric timestamps (hard to read).
         * After disabling: Dates become human-readable strings like "2026-04-20".
         */
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        /*
         * Enable support for java.time (JSR-310) classes.
         * Required for: LocalDate, LocalTime, LocalDateTime, etc.
         * Without this: Jackson cannot properly serialize/deserialize these types.
         */
        mapper.registerModule(new JavaTimeModule());

        /*
         * Handle unknown enum values safely.
         * Problem: If client sends invalid enum value → exception thrown.
         * Solution: Convert unknown enum values to null instead of failing.
         * Example:"gender": "INVALID" → gender = null
         * Note: Combine with @NotNull if strict validation is required.
         */
        mapper.enable(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL);

        return mapper;
    }
}