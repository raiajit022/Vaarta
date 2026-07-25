package com.vaarta.auth.dto;
import java.util.UUID;
public record InitProfileRequest(UUID id, String displayName) {}
