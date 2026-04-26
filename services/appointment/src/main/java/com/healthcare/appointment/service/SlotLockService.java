package com.healthcare.appointment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Distributed slot-locking via Redis SETNX.
 *
 * <p>Prevents concurrent booking of the same slot by multiple patients.
 * The lock is advisory — it guards the window between "slot is available"
 * check and the DB {@code UPDATE slot SET status = LOCKED}, combined with
 * optimistic locking ({@code @Version}) on the {@link com.healthcare.appointment.entity.Slot}
 * entity as the final safety net.
 *
 * <p><b>Design principle for lock release:</b> {@link #releaseLock} is always
 * best-effort. If Redis is unavailable the method logs a warning and returns
 * {@code false} — it must never throw, because callers invoke it from inside
 * a {@code @Transactional} method and an unchecked exception would roll back
 * an already-persisted DB state, causing data inconsistency. The Redis TTL
 * ({@value #LOCK_TTL_MINUTES} min) guarantees the lock expires automatically.
 */

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
    private static final int LOCK_TTL_MINUTES = 10;
    private static final Duration LOCK_TTL = Duration.ofMinutes(LOCK_TTL_MINUTES);

    private final StringRedisTemplate redisTemplate;

    /**
     * Atomically acquires the lock for {@code slotId} if not already held.
     * <p>Uses Redis {@code SET NX PX} — atomic, so race-condition safe across
     * horizontally-scaled instances.
     *
     * @param slotId    slot to lock
     * @param patientId the acquiring patient (stored as the lock value for ownership checks)
     * @return {@code true} if lock was acquired, {@code false} if already held by someone else
     */
    public boolean acquireLock(String slotId, String patientId) {
        String key = lockKey(slotId);

        try {
            Boolean acquired = redisTemplate.opsForValue()
                    .setIfAbsent(key, patientId, LOCK_TTL);

            if (Boolean.TRUE.equals(acquired)) {
                log.debug("Slot lock acquired - slotId: {}, patientId: {}, ttl: {}min",
                        slotId, patientId, LOCK_TTL_MINUTES);
                return true;
            }

            log.debug("Slot lock not acquired — slotId: {} already locked by another patient", slotId);
            return false;

        } catch (Exception e) {
            // Redis down — fail open to prevent service disruption.
            // The DB-level optimistic lock (@Version) is the final safety net.
            log.error("Redis error during lock acquisition — slotId: {}, patientId: {}. " +
                            "Falling back to DB-level optimistic lock. error: {}",
                    slotId, patientId, e.getMessage());
            return false;
        }
    }

    /**
     * Releases the lock for {@code slotId} only if {@code patientId} is the current owner.
     * <p><b>Best-effort:</b> This method never throws. If Redis is unavailable, or the lock
     * has already expired (TTL elapsed), it logs a warning and returns {@code false}.
     * Callers must not treat a {@code false} return as a failure — the TTL ensures the
     * lock will expire on its own.
     *
     * @param slotId    slot to unlock
     * @param patientId must match the value stored in Redis; prevents one patient from
     *                  releasing another patient's lock
     * @return {@code true} if the lock was released, {@code false} otherwise
     */
    public boolean releaseLock(String slotId, String patientId) {
        String key = lockKey(slotId);

        try {
            String currentOwner = redisTemplate.opsForValue().get(key);

            if (currentOwner == null) {
                // Lock already expired (TTL elapsed) or was never held — nothing to do.
                log.debug("Slot lock already expired or absent — slotId: {}", slotId);
                return false;
            }

            if (!patientId.equals(currentOwner)) {
                // Lock is owned by a different patient — do not touch it.
                log.warn("Slot lock release skipped — slotId: {}, requestedBy: {}, actualOwner: {}",
                        slotId, patientId, currentOwner);
                return false;
            }

            redisTemplate.delete(key);
            log.debug("Slot lock released — slotId: {}, patientId: {}", slotId, patientId);
            return true;

        } catch (Exception e) {
            // Best-effort: log and continue. The TTL will clean this up automatically.
            log.warn("Redis error during lock release — slotId: {}, patientId: {}. " +
                            "Lock will expire after {}min via TTL. error: {}",
                    slotId, patientId, LOCK_TTL_MINUTES, e.getMessage());
            return false;
        }
    }

    /**
     * Check whether a slot currently has an active lock
     *
     * @param slotId the ID of the slot to check
     * @return true if slot is locked, false otherwise
     */
    public boolean isLocked(String slotId) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(lockKey(slotId)));
        } catch (Exception e) {
            log.warn("Redis error during lock status check — slotId: {}, assuming unlocked. error: {}",
                    slotId, e.getMessage());
            return false;
        }
    }

    /**
     * Form the lock key for a given slot using the slot ID
     *
     * @param slotId the ID of the slot for which the lock is to be acquired
     * @return the lock key
     */
    private String lockKey(String slotId) {
        return LOCK_PREFIX + slotId;
    }
}