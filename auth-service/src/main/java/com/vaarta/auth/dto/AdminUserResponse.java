package com.vaarta.auth.dto;

import com.vaarta.auth.model.Role;
import com.vaarta.auth.model.User;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        boolean emailVerified,
        boolean disabled,
        OffsetDateTime createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isEmailVerified(),
                user.isDisabled(),
                user.getCreatedAt()
        );
    }
}
