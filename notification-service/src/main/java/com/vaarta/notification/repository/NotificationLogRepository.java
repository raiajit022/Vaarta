package com.vaarta.notification.repository;

import com.vaarta.notification.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for managing {@link com.vaarta.notification.model.NotificationLog} entities.
 */
@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
}
