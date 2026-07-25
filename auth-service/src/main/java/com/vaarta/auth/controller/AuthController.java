package com.vaarta.auth.controller;

import com.vaarta.auth.dto.*;
import com.vaarta.auth.model.User;
import com.vaarta.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for all authentication endpoints.
 *
 * <p>All endpoints live under {@code /api/auth}. Public endpoints are
 * configured in {@link com.vaarta.auth.config.SecurityConfig}; only
 * {@code GET /me} requires a valid Bearer token.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Creates a new account and sends a verification email.
     * Returns 201 with no body — the user must verify their email before logging in.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("message", "Registration successful. Please check your email to verify your account."));
    }

    /**
     * GET /api/auth/verify-email?token=...
     * Marks the user's email as verified.
     * The frontend redirects to this path when the user clicks the email link.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestParam String token
    ) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
    }

    /**
     * POST /api/auth/login
     * Authenticates with email + password.
     * Returns an access token (15 min) and a refresh token (7 days).
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * POST /api/auth/refresh
     * Rotates the refresh token and issues a fresh access token.
     * The old refresh token is revoked on success.
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    /**
     * POST /api/auth/forgot-password
     * Sends a reset email if the address is registered.
     * Always returns 200 — prevents user enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, you'll receive a reset link shortly."));
    }

    /**
     * POST /api/auth/reset-password
     * Sets a new password using the one-time token from the email link.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in with your new password."));
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user's profile.
     * Requires a valid Bearer token in the Authorization header.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
