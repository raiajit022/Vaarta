package com.vaarta.auth.controller;

import com.vaarta.auth.dto.AdminUserResponse;
import com.vaarta.auth.model.Role;
import com.vaarta.auth.model.User;
import com.vaarta.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository.findAll().stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<AdminUserResponse> updateRole(@PathVariable UUID id, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole(Role.valueOf(request.role()));
        userRepository.save(user);
        
        return ResponseEntity.ok(AdminUserResponse.from(user));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<AdminUserResponse> toggleDisable(@PathVariable UUID id, @RequestBody DisableUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setDisabled(request.disabled());
        userRepository.save(user);
        
        return ResponseEntity.ok(AdminUserResponse.from(user));
    }
}

record RoleUpdateRequest(String role) {}
record DisableUpdateRequest(boolean disabled) {}
