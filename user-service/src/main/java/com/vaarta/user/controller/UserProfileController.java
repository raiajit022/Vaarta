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

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Value("${app.internal-key}")
    private String internalKey;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal String userId) {
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(userProfileService.getProfile(UUID.fromString(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal String userId,
            @RequestBody UpdateProfileRequest request) {
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(userProfileService.updateProfile(UUID.fromString(userId), request));
    }

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
