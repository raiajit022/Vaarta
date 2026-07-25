package com.vaarta.meeting.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public class ChatMessageResponse {
    private UUID id;
    private UUID meetingId;
    private UUID senderId;
    private String content;
    private ZonedDateTime sentAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public ZonedDateTime getSentAt() { return sentAt; }
    public void setSentAt(ZonedDateTime sentAt) { this.sentAt = sentAt; }
}
