package com.vaarta.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter for securing internal API endpoints.
 */
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${app.internal-api-key}")
    private String expectedApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Only enforce the internal API key on /internal/** endpoints.
        if (!request.getRequestURI().startsWith("/internal")) {
            filterChain.doFilter(request, response);
            return;
        }

        String providedKey = request.getHeader("X-Internal-Key");

        if (expectedApiKey == null || expectedApiKey.isEmpty()) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "API key not configured");
            return;
        }

        if (providedKey == null || !providedKey.equals(expectedApiKey)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or missing X-Internal-Key");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
