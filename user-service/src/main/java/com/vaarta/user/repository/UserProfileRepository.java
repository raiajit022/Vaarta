package com.vaarta.user.repository;

import com.vaarta.user.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for managing {@link com.vaarta.user.model.UserProfile} entities.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
}
