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

/**
 * REST controller for administrative user management.
 *
 * <p>All endpoints under {@code /api/admin/users} require the caller to have the {@code ADMIN} role,
 * which is enforced by the Spring Security configuration. This controller provides functionality
 * for viewing the user list, modifying user roles, and disabling/enabling accounts.
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    /**
     * Retrieves a list of all registered users.
     *
     * @return a list of user details including ID, email, name, role, and disabled status.
     */
    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository.findAll().stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Updates the role of a specific user.
     *
     * @param id      the UUID of the user to update.
     * @param request the new role to assign (e.g., ADMIN, USER).
     * @return the updated user profile.
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<AdminUserResponse> updateRole(@PathVariable UUID id, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole(Role.valueOf(request.role()));
        userRepository.save(user);
        
        return ResponseEntity.ok(AdminUserResponse.from(user));
    }

    /**
     * Toggles the disabled status of a specific user.
     * Disabled users cannot log in or authenticate with the system.
     *
     * @param id      the UUID of the user to update.
     * @param request the new disabled status (true to disable, false to enable).
     * @return the updated user profile.
     */
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
