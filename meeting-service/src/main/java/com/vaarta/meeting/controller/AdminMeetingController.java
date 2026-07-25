package com.vaarta.meeting.controller;

import com.vaarta.meeting.dto.MeetingResponse;
import com.vaarta.meeting.model.Meeting;
import com.vaarta.meeting.model.MeetingStatus;
import com.vaarta.meeting.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/meetings")
@RequiredArgsConstructor
public class AdminMeetingController {

    private final MeetingRepository meetingRepository;

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings() {
        // Find all meetings and map them to MeetingResponse
        List<MeetingResponse> meetings = meetingRepository.findAll().stream()
                .map(MeetingResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(meetings);
    }

    @PostMapping("/{id}/force-end")
    public ResponseEntity<MeetingResponse> forceEndMeeting(@PathVariable UUID id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found"));

        if (meeting.getStatus() != MeetingStatus.ENDED) {
            meeting.setStatus(MeetingStatus.ENDED);
            meeting.setEndedAt(ZonedDateTime.now());
            meetingRepository.save(meeting);
        }

        return ResponseEntity.ok(MeetingResponse.from(meeting));
    }
}
