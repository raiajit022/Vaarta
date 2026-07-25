package com.vaarta.user.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String displayName,
        String avatarUrl,
        String organization,
        String timezone
) {
}
