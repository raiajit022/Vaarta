package com.vaarta.user.dto;

import java.util.UUID;

/**
 * Data Transfer Object for representing a user profile.
 */
public record UserProfileResponse(
        UUID id,
        String displayName,
        String avatarUrl,
        String organization,
        String timezone
) {
}
