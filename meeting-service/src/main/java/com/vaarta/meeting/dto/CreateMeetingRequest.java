package com.vaarta.meeting.dto;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * Data Transfer Object for creating a new meeting.
 */
public class CreateMeetingRequest {
    private String title;
    private ZonedDateTime scheduledStart;
    private List<String> participantEmails;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public ZonedDateTime getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(ZonedDateTime scheduledStart) { this.scheduledStart = scheduledStart; }
    public List<String> getParticipantEmails() { return participantEmails; }
    public void setParticipantEmails(List<String> participantEmails) { this.participantEmails = participantEmails; }
}
