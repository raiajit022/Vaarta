package com.vaarta.user.dto;

import java.util.UUID;

/**
 * Data Transfer Object for initializing a user profile.
 */
public record InitProfileRequest(
        UUID id,
        String displayName
) {
}
