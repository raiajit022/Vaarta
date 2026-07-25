package com.vaarta.auth.repository;

/**
 * Repository interface for managing {@link com.vaarta.auth.model.User} entities.
 */

import com.vaarta.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
