package com.vaarta.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/auth/register.
 *
 * @param email    Work email address (must be valid format).
 * @param password Plain-text password; min 8 chars. BCrypt-hashed before storage.
 * @param fullName Optional display name.
 */
public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        String fullName
) {}
