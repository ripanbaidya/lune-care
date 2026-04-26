package com.healthcare.appointment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlotLockService {

    /**
     * {@code slot:lock:<slotId>}, patientId (identifier of the user who acquired the lock)
     * <p>It Prevent multiple users from booking the same appointment slot concurrently.
     * Acts as a lightweight distributed lock.
     */
    private static final String LOCK_PREFIX = "slot:lock:";

    /**
     * Automatically expires the lock after a fixed duration.
     * It Prevents deadlocks if a service crashes before releasing the lock
     * Ensures eventual consistency in distributed systems
     */
    private static final Duration LOCK_TTL = Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;

    /**
     * Uses Redis SETNX (SET if Not Exists) with TTL.
     * This operation is atomic in Redis, ensuring race-condition safety
     *
     * @param slotId    the ID of the slot to lock
     * @param patientId the ID of the user who is attempting to acquire the lock
     * @return true if lock was successfully acquired, false otherwise
     */
    public boolean acquireLock(String slotId, String patientId) {
        String key = LOCK_PREFIX + slotId;

        Boolean acquired = redisTemplate
                .opsForValue()
                .setIfAbsent(key, patientId, LOCK_TTL);

        if (Boolean.TRUE.equals(acquired)) {
            log.debug("Lock acquired → slotId: {}, patientId: {}", slotId, patientId);
            return true;
        }

        log.debug("Lock acquisition failed → slotId: {} already locked", slotId);
        return false;
    }

    /**
     * Deletes the lock ONLY if the current caller owns it.
     * Why this matters:
     * - Prevents one user from accidentally deleting another user's lock
     * - Critical in distributed systems with retries or delayed execution
     *
     * @param slotId    the ID of the slot to unlock (must match the locked slot)
     * @param patientId the ID of the user who is attempting to release the lock
     * @return true if lock was successfully released, false otherwise
     */
    public boolean releaseLock(String slotId, String patientId) {
        String key = LOCK_PREFIX + slotId;
        String currentOwner = redisTemplate.opsForValue().get(key);

        if (patientId.equals(currentOwner)) {
            redisTemplate.delete(key);
            log.debug("Lock released → slotId: {}, patientId: {}", slotId, patientId);
            return true;
        }

        log.warn("Lock release skipped → slotId: {}, requestedBy: {}, actualOwner: {}",
                slotId, patientId, currentOwner);

        return false;
    }

    /**
     * Check Lock Status
     *
     * @return true if slot is locked, false otherwise
     */
    public boolean isLocked(String slotId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(LOCK_PREFIX + slotId));
    }
}