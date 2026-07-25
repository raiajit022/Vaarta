package com.vaarta.user.service;

import com.vaarta.user.dto.InitProfileRequest;
import com.vaarta.user.dto.UpdateProfileRequest;
import com.vaarta.user.dto.UserProfileResponse;
import com.vaarta.user.model.UserProfile;
import com.vaarta.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

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

    public UserProfileResponse getProfile(UUID id) {
        UserProfile profile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToResponse(profile);
    }

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
