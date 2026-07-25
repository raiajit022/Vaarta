package com.vaarta.meeting.dto;

import java.time.ZonedDateTime;

public class CreateMeetingRequest {
    private String title;
    private ZonedDateTime scheduledStart;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public ZonedDateTime getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(ZonedDateTime scheduledStart) { this.scheduledStart = scheduledStart; }
}
