package com.vaarta.auth.service;

import com.vaarta.auth.config.JwtConfig;
import com.vaarta.auth.model.RefreshToken;
import com.vaarta.auth.model.User;
import com.vaarta.auth.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.UUID;

/**
 * Handles all JWT and refresh-token operations:
 * <ul>
 *   <li>Generate short-lived access tokens (HS256 JWT).</li>
 *   <li>Generate and store long-lived refresh tokens.</li>
 *   <li>Validate / rotate refresh tokens.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtConfig jwtConfig;
    private final RefreshTokenRepository refreshTokenRepository;

    // ── Access Tokens (JWT) ────────────────────────────────────────────────

    /**
     * Generates a signed HS256 JWT with the user's email as subject and role as claim.
     * Expiry: 15 minutes (configurable via application.yml).
     */
    public String generateAccessToken(User user) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId().toString())
                .issuedAt(new Date(now))
                .expiration(new Date(now + jwtConfig.getAccessTokenExpiryMs()))
                .signWith(getSigningKey())
                .compact();
    }

    /** Extracts the email (subject) from a JWT, or null if invalid. */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /** Returns true if the token is not expired and the subject matches the UserDetails email. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject().equals(userDetails.getUsername())
                    && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // ── Refresh Tokens ─────────────────────────────────────────────────────

    /**
     * Creates a new refresh token for the user, stored in the database.
     * Any previous tokens are NOT automatically revoked here — call
     * {@link #revokeAllRefreshTokens} explicitly on sign-out or password change.
     */
    @Transactional
    public RefreshToken generateRefreshToken(User user) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(OffsetDateTime.now().plusSeconds(
                        jwtConfig.getRefreshTokenExpiryMs() / 1000))
                .build();
        return refreshTokenRepository.save(token);
    }

    /**
     * Validates and rotates a refresh token.
     * The old token is revoked; a new one is issued.
     *
     * @return New access token + new refresh token.
     * @throws IllegalArgumentException if the token is invalid, expired, or revoked.
     */
    @Transactional
    public TokenPair rotateRefreshToken(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!stored.isValid()) {
            throw new IllegalArgumentException("Refresh token is expired or revoked");
        }

        // Revoke the old token
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        // Issue fresh tokens
        User user = stored.getUser();
        String newAccess = generateAccessToken(user);
        RefreshToken newRefresh = generateRefreshToken(user);

        return new TokenPair(newAccess, newRefresh.getToken());
    }

    /** Revokes all refresh tokens for the given user (call on sign-out / password change). */
    @Transactional
    public void revokeAllRefreshTokens(User user) {
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Simple value holder for a token pair returned after a refresh. */
    public record TokenPair(String accessToken, String refreshToken) {}
}
