package com.vaarta.auth.repository;

import com.vaarta.auth.model.AdminAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Read/append access to the admin audit trail.
 *
 * <p>No delete or update methods are exposed — the log is append-only, and the
 * absence of those methods is the enforcement.
 */
public interface AdminAuditRepository extends JpaRepository<AdminAudit, UUID> {

    Page<AdminAudit> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
