package com.vaarta.auth.dto;

import com.vaarta.auth.model.Role;
import com.vaarta.auth.model.User;

import java.util.UUID;

/** Response body for GET /api/auth/me. */
public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        boolean emailVerified
) {
    /** Factory method — builds from the JPA entity. */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isEmailVerified()
        );
    }
}
