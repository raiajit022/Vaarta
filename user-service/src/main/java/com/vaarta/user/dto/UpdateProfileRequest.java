package com.vaarta.user.dto;

/**
 * Data Transfer Object for updating a user profile.
 */
public record UpdateProfileRequest(
        String displayName,
        String avatarUrl,
        String organization,
        String timezone
) {
}
