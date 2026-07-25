package com.vaarta.meeting.config;

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
 *
 * <p>Validates the presence and correctness of the {@code X-Internal-Key} header
 * to ensure that only authorized internal microservices can access specific routes.
 */
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${app.internal-api-key}")
    private String expectedApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip actuator endpoints for health checks
        if (request.getRequestURI().startsWith("/actuator")) {
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
