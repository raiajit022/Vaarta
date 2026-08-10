package com.vaarta.auth.controller;

import com.vaarta.auth.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Lets other services append to the audit trail.
 *
 * <p>auth-service owns the audit log because it owns identity. Rather than have
 * meeting-service reach into another service's schema, it posts here over the
 * existing internal-API-key channel — the same pattern as
 * {@link InternalUserController}, secured by {@code InternalApiKeyFilter}.
 */
@RestController
@RequestMapping("/internal/audit")
@RequiredArgsConstructor
public class InternalAuditController {

    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<Void> record(@RequestBody Map<String, String> body) {
        String actorId = body.get("actorId");
        String action = body.get("action");
        String targetType = body.get("targetType");
        String targetId = body.get("targetId");

        if (actorId == null || action == null || targetType == null || targetId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            auditService.record(
                    UUID.fromString(actorId),
                    action,
                    targetType,
                    UUID.fromString(targetId),
                    body.get("detail"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.accepted().build();
    }
}
