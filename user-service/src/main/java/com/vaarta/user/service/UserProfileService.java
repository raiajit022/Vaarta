package com.vaarta.user.service;

import com.vaarta.user.dto.InitProfileRequest;
import com.vaarta.user.dto.UpdateProfileRequest;
import com.vaarta.user.dto.UserProfileResponse;
import com.vaarta.user.model.UserProfile;
import com.vaarta.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for managing user profiles.
 *
 * <p>Handles the creation of blank profiles during registration and
 * updates to user preferences (display name, avatar, timezone, etc.).
 */
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    /**
     * Initializes a blank profile for a newly registered user.
     * This is typically called via an internal API request from the auth-service.
     *
     * @param req the initialization details including the user's UUID.
     */
    public void initProfile(InitProfileRequest req) {
        if (userProfileRepository.existsById(req.id())) {
            return; // Already initialized
        }
        UserProfile profile = UserProfile.builder()
                .id(req.id())
                .displayName(req.displayName())
                .build();
        userProfileRepository.save(profile);
    }

    /**
     * Retrieves a user's profile by their UUID.
     *
     * @param id the UUID of the user.
     * @return the user profile data.
     * @throws RuntimeException if the profile does not exist.
     */
    public UserProfileResponse getProfile(UUID id) {
        UserProfile profile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToResponse(profile);
    }

    /**
     * Updates an existing user's profile with new data.
     * Only provided fields are updated (e.g., blank display names are ignored).
     *
     * @param id  the UUID of the user.
     * @param req the fields to update.
     * @return the updated user profile data.
     * @throws RuntimeException if the profile does not exist.
     */
    public UserProfileResponse updateProfile(UUID id, UpdateProfileRequest req) {
        UserProfile profile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (req.displayName() != null && !req.displayName().isBlank()) {
            profile.setDisplayName(req.displayName());
        }
        profile.setAvatarUrl(req.avatarUrl());
        profile.setOrganization(req.organization());
        if (req.timezone() != null && !req.timezone().isBlank()) {
            profile.setTimezone(req.timezone());
        }

        userProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        return new UserProfileResponse(
                profile.getId(),
                profile.getDisplayName(),
                profile.getAvatarUrl(),
                profile.getOrganization(),
                profile.getTimezone()
        );
    }
}
