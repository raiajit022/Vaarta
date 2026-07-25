package com.vaarta.auth.dto;

import com.vaarta.auth.model.Role;

import java.util.UUID;

/**
 * Response body for POST /api/auth/login and POST /api/auth/refresh.
 *
 * @param accessToken  Short-lived JWT (15 min). Attached as Bearer token on every request.
 * @param refreshToken Long-lived opaque token (7 days). Used only to obtain a new access token.
 * @param user         Minimal user info needed by the frontend immediately after login.
 */
public record LoginResponse(
        String accessToken,
        String refreshToken,
        UserInfo user
) {
    public record UserInfo(
            UUID id,
            String email,
            String fullName,
            Role role,
            boolean emailVerified
    ) {}
}
