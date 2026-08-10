package com.vaarta.auth.controller;

import com.vaarta.auth.dto.AdminUserResponse;
import com.vaarta.auth.model.AdminAudit;
import com.vaarta.auth.model.Role;
import com.vaarta.auth.model.User;
import com.vaarta.auth.repository.UserRepository;
import com.vaarta.auth.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
 *
 * <p>Both mutating endpoints append to the admin audit trail — these are the actions
 * that can lock a person out of the product, so the record of who performed them
 * matters as much as the action itself.
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    /**
     * Capped rather than paginated: at current scale a pager would be dead code.
     * Revisit when the table realistically exceeds a few hundred rows.
     */
    private static final int MAX_USERS = 500;

    private final UserRepository userRepository;
    private final AuditService auditService;

    /** The admin making the request, taken from the JWT rather than the payload. */
    private UUID currentAdminId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    /**
     * Retrieves the registered users, newest first.
     *
     * @return a list of user details including ID, email, name, role, and disabled status.
     */
    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository
                .findAll(PageRequest.of(0, MAX_USERS, Sort.by("createdAt").descending()))
                .getContent()
                .stream()
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

        Role previous = user.getRole();
        user.setRole(Role.valueOf(request.role()));
        userRepository.save(user);

        auditService.record(currentAdminId(), AdminAudit.USER_ROLE_CHANGED, "USER", id,
                previous + " -> " + user.getRole());

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

        auditService.record(currentAdminId(), AdminAudit.USER_DISABLED, "USER", id,
                request.disabled() ? "disabled" : "re-enabled");

        return ResponseEntity.ok(AdminUserResponse.from(user));
    }
}

record RoleUpdateRequest(String role) {}
record DisableUpdateRequest(boolean disabled) {}
