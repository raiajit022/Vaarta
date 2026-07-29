package com.vaarta.meeting.controller;

import com.vaarta.meeting.dto.CreateMeetingRequest;
import com.vaarta.meeting.dto.MeetingResponse;
import com.vaarta.meeting.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for user-facing meeting operations.
 *
 * <p>Handles creating, joining, and listing meetings for the currently authenticated user.
 */
@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    private UUID getCurrentUserId() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userIdStr);
    }

    /**
     * Creates a new meeting. The caller is automatically designated as the host.
     *
     * @param request the meeting configuration (title, type, scheduled time, etc.).
     * @return the created meeting details, including the join code.
     */
    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@RequestBody CreateMeetingRequest request) {
        MeetingResponse response = meetingService.createMeeting(request, getCurrentUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves all meetings associated with the currently authenticated user
     * (either as a host or as a participant).
     *
     * @return a list of meetings.
     */
    @GetMapping("/me")
    public ResponseEntity<List<MeetingResponse>> getMyMeetings() {
        return ResponseEntity.ok(meetingService.getMyMeetings(getCurrentUserId()));
    }

    /**
     * Retrieves the details of a specific meeting.
     *
     * @param id the UUID of the meeting.
     * @return the meeting details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeeting(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.getMeeting(id));
    }

    /**
     * Joins a meeting using a short join code.
     * Adds the current user to the meeting's participant list if not already present.
     *
     * @param joinCode the unique 9-character code for the meeting.
     * @return the meeting details.
     */
    @PostMapping("/join/{joinCode}")
    public ResponseEntity<MeetingResponse> joinMeeting(@PathVariable String joinCode) {
        return ResponseEntity.ok(meetingService.joinMeeting(joinCode, getCurrentUserId()));
    }

    /**
     * Ends a meeting. Only the host of the meeting can perform this action.
     *
     * @param id the UUID of the meeting to end.
     * @return HTTP 200 OK on success.
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<Void> endMeeting(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        meetingService.endMeeting(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Generates a summary for the meeting using the AI service.
     */
    @PostMapping("/{id}/summary:generate")
    public ResponseEntity<MeetingResponse> generateSummary(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        MeetingResponse response = meetingService.generateSummary(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Generates action items for the meeting using the AI service.
     */
    @PostMapping("/{id}/action-items:generate")
    public ResponseEntity<MeetingResponse> generateActionItems(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        MeetingResponse response = meetingService.generateActionItems(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Generates sentiment for the meeting using the AI service.
     */
    @PostMapping("/{id}/sentiment:generate")
    public ResponseEntity<MeetingResponse> generateSentiment(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        MeetingResponse response = meetingService.generateSentiment(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Suggests a title and agenda for a meeting based on a description.
     * This endpoint is called before a meeting is created.
     */
    @PostMapping("/suggest-agenda")
    public ResponseEntity<java.util.Map<String, Object>> suggestAgenda(@RequestBody java.util.Map<String, String> payload) {
        String description = payload.get("description");
        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(meetingService.suggestAgenda(description));
    }
}
