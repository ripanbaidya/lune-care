package com.healthcare.auth.respository;

import com.healthcare.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Query("""
            select prt from PasswordResetToken prt
            where prt.user.id = :userId
              and prt.used = false
              and prt.expiresAt > :now
            order by prt.createdAt desc
            """)
    Optional<PasswordResetToken> findActiveByUserId(
            @Param("userId") String userId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
            update PasswordResetToken prt
               set prt.used = true,
                   prt.usedAt = :now
             where prt.user.id = :userId
               and prt.used = false
               and prt.expiresAt > :now
            """)
    int revokeActiveTokensByUserId(
            @Param("userId") String userId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
            delete from PasswordResetToken prt
            where prt.used = true or prt.expiresAt < :now
            """)
    int deleteAllInactiveTokens(@Param("now") Instant now);
}
