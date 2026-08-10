package com.vaarta.meeting.repository;

import com.vaarta.meeting.model.MeetingNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/** Repository for the per-meeting shared note document. */
public interface MeetingNoteRepository extends JpaRepository<MeetingNote, UUID> {
}
