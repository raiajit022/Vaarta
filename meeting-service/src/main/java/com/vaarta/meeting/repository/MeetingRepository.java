package com.vaarta.meeting.repository;

import com.vaarta.meeting.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

/**
 * Repository interface for managing {@link com.vaarta.meeting.model.Meeting} entities.
 */
@Repository
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    Optional<Meeting> findByJoinCode(String joinCode);
    List<Meeting> findByHostIdOrderByCreatedAtDesc(UUID hostId);
}
