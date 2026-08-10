package com.vaarta.auth.service;

import com.vaarta.auth.model.AdminAudit;
import com.vaarta.auth.repository.AdminAuditRepository;
import com.vaarta.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Records privileged admin actions.
 *
 * <p>Writing an audit row must never be the reason a legitimate admin action
 * fails, so failures here are logged rather than propagated. The trade-off is
 * deliberate: losing one audit row is preferable to blocking an admin from
 * disabling a compromised account.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AdminAuditRepository auditRepository;
    private final UserRepository userRepository;

    /**
     * Appends an entry to the audit trail.
     *
     * @param actorId    the admin performing the action
     * @param action     one of the {@code AdminAudit} action constants
     * @param targetType {@code USER} or {@code MEETING}
     * @param targetId   the thing being acted upon
     * @param detail     human-readable specifics, e.g. {@code "USER -> ADMIN"}
     */
    public void record(UUID actorId, String action, String targetType, UUID targetId, String detail) {
        try {
            AdminAudit entry = new AdminAudit();
            entry.setActorId(actorId);
            entry.setActorEmail(
                    userRepository.findById(actorId)
                            .map(u -> u.getEmail())
                            .orElse("unknown"));
            entry.setAction(action);
            entry.setTargetType(targetType);
            entry.setTargetId(targetId);
            entry.setDetail(detail);
            auditRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to write audit entry: action={} target={}/{}", action, targetType, targetId, e);
        }
    }
}
