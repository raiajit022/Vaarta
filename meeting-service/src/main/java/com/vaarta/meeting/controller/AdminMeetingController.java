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

/**
 * REST controller for administrative meeting management.
 *
 * <p>All endpoints under {@code /api/admin/meetings} require the caller to have the {@code ADMIN} role,
 * which is enforced by the Spring Security configuration. This controller provides functionality
 * for monitoring active meetings and forcibly terminating them if necessary.
 */
@RestController
@RequestMapping("/api/admin/meetings")
@RequiredArgsConstructor
public class AdminMeetingController {

    private final MeetingRepository meetingRepository;

    /**
     * Retrieves a list of all meetings across the platform, regardless of their status.
     *
     * @return a list of all meetings.
     */
    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings() {
        List<MeetingResponse> meetings = meetingRepository.findAll().stream()
                .map(MeetingResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(meetings);
    }

    /**
     * Forcibly ends an active meeting.
     * This is useful for moderation purposes or if a meeting is stuck in an active state.
     *
     * @param id the UUID of the meeting to terminate.
     * @return the updated meeting details.
     */
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
