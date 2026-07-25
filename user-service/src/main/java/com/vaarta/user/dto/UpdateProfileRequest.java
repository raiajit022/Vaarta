package com.vaarta.user.dto;

public record UpdateProfileRequest(
        String displayName,
        String avatarUrl,
        String organization,
        String timezone
) {
}
