package com.vaarta.meeting.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Entity representing a participant's association and timeline within a meeting.
 */
@Entity
@Table(name = "meeting_participants")
public class MeetingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String role = "PARTICIPANT"; // HOST, PARTICIPANT

    @Column(name = "joined_at")
    private ZonedDateTime joinedAt;

    @Column(name = "left_at")
    private ZonedDateTime leftAt;

    public MeetingParticipant() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public ZonedDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(ZonedDateTime joinedAt) { this.joinedAt = joinedAt; }
    public ZonedDateTime getLeftAt() { return leftAt; }
    public void setLeftAt(ZonedDateTime leftAt) { this.leftAt = leftAt; }
}
