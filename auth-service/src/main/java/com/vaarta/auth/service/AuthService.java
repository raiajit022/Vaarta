package com.vaarta.auth.service;

import com.vaarta.auth.dto.*;
import com.vaarta.auth.model.EmailVerificationToken;
import com.vaarta.auth.model.PasswordResetToken;
import com.vaarta.auth.model.RefreshToken;
import com.vaarta.auth.model.User;
import com.vaarta.auth.repository.EmailVerificationTokenRepository;
import com.vaarta.auth.repository.PasswordResetTokenRepository;
import com.vaarta.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Core authentication business logic.
 *
 * <p>Orchestrates user registration, email verification, login, token refresh,
 * and the forgot/reset-password flows. All password storage uses BCrypt.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository evtRepository;
    private final PasswordResetTokenRepository prtRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${app.user-service-url}")
    private String userServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${app.internal-key}")
    private String internalKey;

    // ── Register ──────────────────────────────────────────────────────────

    /**
     * Registers a new user and sends a verification email.
     * The account is created with {@code emailVerified = false}; the user
     * cannot log in until they click the verification link.
     *
     * @throws IllegalArgumentException if the email is already registered.
     */
    @Transactional
    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = User.builder()
                .email(req.email().toLowerCase().strip())
                .fullName(req.fullName())
                .passwordHash(passwordEncoder.encode(req.password()))
                .build();
        userRepository.save(user);

        // Issue an email verification token (24-hour expiry)
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build();
        evtRepository.save(evt);

        emailService.sendVerificationEmail(user.getEmail(), evt.getToken(), user.getFullName());
        
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Internal-Key", internalKey);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            InitProfileRequest initReq = new InitProfileRequest(user.getId(), user.getFullName());
            org.springframework.http.HttpEntity<InitProfileRequest> requestEntity = new org.springframework.http.HttpEntity<>(initReq, headers);
            
            restTemplate.postForEntity(userServiceUrl + "/api/users/internal/init", requestEntity, Void.class);
            log.info("Initialized user profile in user-service for: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to initialize user profile for: {}", user.getEmail(), e);
            // Non-fatal for auth service, but we should probably handle it or let it fail?
            // If it fails, the user will be registered but won't have a profile. 
            // In a real system, we'd use an outbox pattern or message queue.
            // For now, let it be non-fatal or fail the transaction. Let's fail the transaction to be safe.
            throw new RuntimeException("Failed to initialize user profile", e);
        }
        
        log.info("User registered: {}", user.getEmail());
    }

    // ── Verify Email ──────────────────────────────────────────────────────

    /**
     * Marks a user's email as verified using the one-time token from the email link.
     *
     * @throws IllegalArgumentException if the token is missing, invalid, or expired.
     */
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken evt = evtRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (evt.isExpired()) {
            throw new IllegalArgumentException("Verification token has expired. Please register again.");
        }

        User user = evt.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Clean up all verification tokens for this user
        evtRepository.deleteAllByUserId(user.getId());
        log.info("Email verified for user: {}", user.getEmail());
    }

    // ── Login ─────────────────────────────────────────────────────────────

    /**
     * Authenticates a user with email + password and issues a JWT pair.
     *
     * <p>Returns a deliberately vague error for invalid credentials to prevent
     * user enumeration. Unverified accounts are rejected with a clear message.
     *
     * @throws BadCredentialsException if credentials are wrong or account unverified.
     */
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email().toLowerCase().strip())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Please verify your email before logging in");
        }

        String accessToken = tokenService.generateAccessToken(user);
        RefreshToken refreshToken = tokenService.generateRefreshToken(user);

        return buildLoginResponse(user, accessToken, refreshToken.getToken());
    }

    // ── Refresh ───────────────────────────────────────────────────────────

    /**
     * Rotates the refresh token and issues a new access token.
     *
     * @throws IllegalArgumentException if the refresh token is invalid or expired.
     */
    public LoginResponse refresh(RefreshRequest req) {
        TokenService.TokenPair pair = tokenService.rotateRefreshToken(req.refreshToken());

        // We need the user to build the response — look up by email from the new access token
        String email = tokenService.extractEmail(pair.accessToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildLoginResponse(user, pair.accessToken(), pair.refreshToken());
    }

    // ── Forgot Password ────────────────────────────────────────────────────

    /**
     * Initiates a password reset.
     * Always returns 200 even if the email is not registered — prevents user enumeration.
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.email().toLowerCase().strip()).ifPresent(user -> {
            // Delete any existing reset tokens for this user first
            prtRepository.deleteAllByUserId(user.getId());

            PasswordResetToken prt = PasswordResetToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiresAt(OffsetDateTime.now().plusHours(1))
                    .build();
            prtRepository.save(prt);

            emailService.sendPasswordResetEmail(user.getEmail(), prt.getToken());
            log.info("Password reset email sent to: {}", user.getEmail());
        });
    }

    // ── Reset Password ─────────────────────────────────────────────────────

    /**
     * Resets the user's password using the one-time token from the email link.
     * On success, all refresh tokens are revoked (forces re-login on all devices).
     *
     * @throws IllegalArgumentException if the token is invalid, expired, or already used.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken prt = prtRepository.findByToken(req.token())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (prt.isExpired()) {
            throw new IllegalArgumentException("Reset token has expired. Please request a new one.");
        }

        if (prt.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used.");
        }

        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        // Mark token as used (don't delete so we can audit)
        prt.setUsed(true);
        prtRepository.save(prt);

        // Force re-login on all devices by revoking all refresh tokens
        tokenService.revokeAllRefreshTokens(user);
        log.info("Password reset successful for: {}", user.getEmail());
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private LoginResponse buildLoginResponse(User user, String accessToken, String refreshToken) {
        return new LoginResponse(
                accessToken,
                refreshToken,
                new LoginResponse.UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole(),
                        user.isEmailVerified()
                )
        );
    }
}
