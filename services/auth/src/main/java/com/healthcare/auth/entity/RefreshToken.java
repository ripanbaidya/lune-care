package com.healthcare.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "refresh_token",
        indexes = @Index(name = "idx_refresh_token_user", columnList = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "token", columnDefinition = "TEXT", unique = true)
    private String token;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Revoke the refresh token and mark the timestamp
     */
    public void revoke(Instant now) {
        this.revoked = true;
        this.revokedAt = now;
    }

    /**
     * Check if the refresh token is expired
     */
    public boolean isExpired() {
        return this.expiresAt.isBefore(Instant.now());
    }
}
