package com.vaarta.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Vaarta Auth Service — entry point.
 *
 * <p>
 * Responsibilities: user registration, email verification, JWT-based login,
 * token refresh, forgot/reset password. All other services validate JWTs issued
 * here; they do NOT call back into this service at runtime.
 */
@SpringBootApplication
@EnableCaching
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
