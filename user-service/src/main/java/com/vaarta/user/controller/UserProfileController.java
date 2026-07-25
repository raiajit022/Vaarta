package com.vaarta.user.controller;

import com.vaarta.user.dto.InitProfileRequest;
import com.vaarta.user.dto.UpdateProfileRequest;
import com.vaarta.user.dto.UserProfileResponse;
import com.vaarta.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for managing user profiles.
 *
 * <p>Provides endpoints for users to view and update their own profiles.
 * Also includes an internal endpoint used by the auth-service to initialize
 * a profile when a new user registers.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Value("${app.internal-key}")
    private String internalKey;

    /**
     * Retrieves the profile of the currently authenticated user.
     *
     * @param userId the UUID of the authenticated user, extracted from the JWT.
     * @return the user's profile details.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal String userId) {
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(userProfileService.getProfile(UUID.fromString(userId)));
    }

    /**
     * Updates the profile of the currently authenticated user.
     *
     * @param userId  the UUID of the authenticated user, extracted from the JWT.
     * @param request the profile details to update (e.g., bio, avatarUrl).
     * @return the updated user profile.
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal String userId,
            @RequestBody UpdateProfileRequest request) {
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(userProfileService.updateProfile(UUID.fromString(userId), request));
    }

    /**
     * Internal endpoint used by the auth-service to create a blank profile
     * for a newly registered user.
     *
     * @param providedKey the internal API key for service-to-service authentication.
     * @param request     the initialization details (userId and fullName).
     * @return HTTP 200 OK on success, or 403 if the internal key is invalid.
     */
    @PostMapping("/internal/init")
    public ResponseEntity<Void> initProfile(
            @RequestHeader("X-Internal-Key") String providedKey,
            @RequestBody InitProfileRequest request) {
        if (!internalKey.equals(providedKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userProfileService.initProfile(request);
        return ResponseEntity.ok().build();
    }
}
