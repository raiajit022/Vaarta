package com.vaarta.meeting.repository;

import com.vaarta.meeting.model.MeetingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, UUID> {
    List<MeetingParticipant> findByMeetingId(UUID meetingId);
    Optional<MeetingParticipant> findByMeetingIdAndUserId(UUID meetingId, UUID userId);
    List<MeetingParticipant> findByUserId(UUID userId);
}
