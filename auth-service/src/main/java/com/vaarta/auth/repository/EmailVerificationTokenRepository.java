package com.vaarta.auth.repository;

/**
 * Repository interface for managing {@link com.vaarta.auth.model.EmailVerificationToken} entities.
 */

import com.vaarta.auth.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByToken(String token);

    /** Delete all tokens for a user (called after successful verification). */
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user.id = :userId")
    void deleteAllByUserId(UUID userId);
}
