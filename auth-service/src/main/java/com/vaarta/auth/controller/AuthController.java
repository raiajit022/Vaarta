package com.vaarta.auth.controller;

import com.vaarta.auth.dto.*;
import com.vaarta.auth.model.User;
import com.vaarta.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for all authentication endpoints.
 *
 * <p>
 * All endpoints live under {@code /api/auth}. Public endpoints are
 * configured in {@link com.vaarta.auth.config.SecurityConfig}; only
 * {@code GET /me} requires a valid Bearer token.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;

        /**
         * POST /api/auth/register
         * Creates a new account and sends a verification email.
         * Returns 201 with no body — the user must verify their email before logging
         * in.
         */
        @PostMapping("/register")
        public ResponseEntity<Map<String, String>> register(
                        @Valid @RequestBody RegisterRequest request) {
                log.info("POST /api/auth/register - email={}", request.getEmail());
                authService.register(request);
                log.info("Registration successful for email={}", request.getEmail());
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(Map.of("message",
                                                "Registration successful. Please check your email to verify your account."));
        }

        /**
         * GET /api/auth/verify-email?token=...
         * Marks the user's email as verified.
         * The frontend redirects to this path when the user clicks the email link.
         */
        @GetMapping("/verify-email")
        public ResponseEntity<Map<String, String>> verifyEmail(
                        @RequestParam String token) {
                log.info("GET /api/auth/verify-email - verifying token");
                authService.verifyEmail(token);
                log.info("Email verified successfully");
                return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
        }

        /**
         * POST /api/auth/login
         * Authenticates with email + password.
         * Returns an access token (15 min) and a refresh token (7 days).
         */
        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(
                        @Valid @RequestBody LoginRequest request) {
                log.info("POST /api/auth/login - email={}", request.getEmail());
                LoginResponse response = authService.login(request);
                log.info("Login successful for email={}", request.getEmail());
                return ResponseEntity.ok(response);
        }

        /**
         * POST /api/auth/refresh
         * Rotates the refresh token and issues a fresh access token.
         * The old refresh token is revoked on success.
         */
        @PostMapping("/refresh")
        public ResponseEntity<LoginResponse> refresh(
                        @Valid @RequestBody RefreshRequest request) {
                log.info("POST /api/auth/refresh - rotating token");
                LoginResponse response = authService.refresh(request);
                log.info("Token refresh successful");
                return ResponseEntity.ok(response);
        }

        /**
         * POST /api/auth/forgot-password
         * Sends a reset email if the address is registered.
         * Always returns 200 — prevents user enumeration.
         */
        @PostMapping("/forgot-password")
        public ResponseEntity<Map<String, String>> forgotPassword(
                        @Valid @RequestBody ForgotPasswordRequest request) {
                log.info("POST /api/auth/forgot-password - email={}", request.getEmail());
                authService.forgotPassword(request);
                log.info("Forgot password process completed for email={}", request.getEmail());
                return ResponseEntity.ok(Map.of(
                                "message", "If that email is registered, you'll receive a reset link shortly."));
        }

        /**
         * POST /api/auth/reset-password
         * Sets a new password using the one-time token from the email link.
         */
        @PostMapping("/reset-password")
        public ResponseEntity<Map<String, String>> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest request) {
                log.info("POST /api/auth/reset-password - resetting password");
                authService.resetPassword(request);
                log.info("Password reset successfully");
                return ResponseEntity.ok(Map.of("message",
                                "Password reset successfully. Please log in with your new password."));
        }

        /**
         * GET /api/auth/me
         * Returns the currently authenticated user's profile.
         * Requires a valid Bearer token in the Authorization header.
         */
        @GetMapping("/me")
        public ResponseEntity<UserResponse> me(
                        @AuthenticationPrincipal User user) {
                log.info("GET /api/auth/me - user={}", user.getId());
                return ResponseEntity.ok(UserResponse.from(user));
        }
}
