package com.vaarta.auth.controller;

import com.vaarta.auth.model.User;
import com.vaarta.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Internal REST controller for cross-service data fetching.
 * Secured via InternalApiKeyFilter.
 */
@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    @PostMapping("/emails")
    public ResponseEntity<Map<UUID, String>> getUserEmails(@RequestBody Map<String, List<UUID>> request) {
        List<UUID> userIds = request.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<User> users = userRepository.findAllById(userIds);
        Map<UUID, String> emailMap = users.stream()
                .collect(Collectors.toMap(User::getId, User::getEmail));

        return ResponseEntity.ok(emailMap);
    }
}
