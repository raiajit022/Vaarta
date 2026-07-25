package com.vaarta.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * JWT configuration — reads values from application.yml / environment.
 * These are injected into {@link com.vaarta.auth.service.TokenService}.
 */
@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    public String getSecret() { return secret; }

    public long getAccessTokenExpiryMs() { return accessTokenExpiryMs; }

    public long getRefreshTokenExpiryMs() { return refreshTokenExpiryMs; }
}
