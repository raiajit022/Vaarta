package com.vaarta.auth.controller;

import com.vaarta.auth.model.AdminAudit;
import com.vaarta.auth.repository.AdminAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read access to the admin audit trail.
 *
 * <p>Sits under {@code /api/admin/**}, so Spring Security's
 * {@code hasRole("ADMIN")} rule is what actually gates it. There is intentionally
 * no write endpoint here — entries are appended by {@code AuditService} as a side
 * effect of the action being audited, never by a client.
 */
@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    /**
     * Capped rather than paginated: at current scale a pager would be dead code,
     * and an unbounded query is the only failure mode worth preventing.
     * Revisit when the trail realistically exceeds a few hundred entries.
     */
    private static final int MAX_ENTRIES = 500;

    private final AdminAuditRepository auditRepository;

    @GetMapping
    public ResponseEntity<List<AdminAudit>> getAuditTrail() {
        return ResponseEntity.ok(
                auditRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, MAX_ENTRIES))
                        .getContent());
    }
}
