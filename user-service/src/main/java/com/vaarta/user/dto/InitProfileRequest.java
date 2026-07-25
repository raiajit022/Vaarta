package com.vaarta.user.dto;

import java.util.UUID;

public record InitProfileRequest(
        UUID id,
        String displayName
) {
}
