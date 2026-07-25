package com.vaarta.meeting.dto;

import com.vaarta.meeting.model.MeetingStatus;
import java.time.ZonedDateTime;
import java.util.UUID;

public class MeetingResponse {
    private UUID id;
    private String title;
    private UUID hostId;
    private String joinCode;
    private MeetingStatus status;
    private ZonedDateTime scheduledStart;
    private ZonedDateTime startedAt;
    private ZonedDateTime endedAt;
    private ZonedDateTime createdAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public UUID getHostId() { return hostId; }
    public void setHostId(UUID hostId) { this.hostId = hostId; }
    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    public ZonedDateTime getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(ZonedDateTime scheduledStart) { this.scheduledStart = scheduledStart; }
    public ZonedDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(ZonedDateTime startedAt) { this.startedAt = startedAt; }
    public ZonedDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(ZonedDateTime endedAt) { this.endedAt = endedAt; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }

    public static MeetingResponse from(com.vaarta.meeting.model.Meeting meeting) {
        MeetingResponse response = new MeetingResponse();
        response.setId(meeting.getId());
        response.setTitle(meeting.getTitle());
        response.setHostId(meeting.getHostId());
        response.setJoinCode(meeting.getJoinCode());
        response.setStatus(meeting.getStatus());
        response.setScheduledStart(meeting.getScheduledStart());
        response.setStartedAt(meeting.getStartedAt());
        response.setEndedAt(meeting.getEndedAt());
        response.setCreatedAt(meeting.getCreatedAt());
        return response;
    }
}
