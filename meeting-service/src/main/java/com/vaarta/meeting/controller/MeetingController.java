package com.vaarta.meeting.controller;

import com.vaarta.meeting.dto.CreateMeetingRequest;
import com.vaarta.meeting.dto.MeetingResponse;
import com.vaarta.meeting.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@RequestBody CreateMeetingRequest request) {
        MeetingResponse response = meetingService.createMeeting(request, getCurrentUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<MeetingResponse>> getMyMeetings() {
        return ResponseEntity.ok(meetingService.getMyMeetings(getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeeting(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.getMeeting(id));
    }

    @PostMapping("/join/{joinCode}")
    public ResponseEntity<MeetingResponse> joinMeeting(@PathVariable String joinCode) {
        return ResponseEntity.ok(meetingService.joinMeeting(joinCode, getCurrentUserId()));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Void> endMeeting(@PathVariable UUID id) {
        meetingService.endMeeting(id, getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}
