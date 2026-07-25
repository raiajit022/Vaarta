package com.vaarta.meeting.dto;

/**
 * Data Transfer Object for sending a new chat message in a meeting.
 */
public class ChatMessageRequest {
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
