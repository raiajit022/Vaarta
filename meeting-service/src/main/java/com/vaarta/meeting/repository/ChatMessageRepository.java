package com.vaarta.meeting.repository;

import com.vaarta.meeting.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing {@link com.vaarta.meeting.model.ChatMessage} entities.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByMeetingIdOrderBySentAtAsc(UUID meetingId);
}
