package com.vaarta.meeting.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * The shared note document for a meeting.
 *
 * <p>One row per meeting — the meeting id <em>is</em> the primary key, so there is
 * no separate surrogate key. Notes are last-write-wins: the panel debounces saves
 * and broadcasts edits over the LiveKit data channel, so this table only needs to
 * hold the latest state rather than a merge history.
 */
@Entity
@Table(name = "meeting_notes")
public class MeetingNote {

    @Id
    @Column(name = "meeting_id")
    private UUID meetingId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content = "";

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    public MeetingNote() {}

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}
