package com.vaarta.auth.dto;

import java.util.UUID;

/**
 * Request payload for initializing a new user profile via the internal message
 * bus.
 */
public record InitProfileRequest(UUID id, String displayName) {
}
