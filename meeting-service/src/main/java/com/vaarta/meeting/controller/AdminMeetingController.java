package com.vaarta.meeting.controller;

import com.vaarta.meeting.dto.MeetingResponse;
import com.vaarta.meeting.model.Meeting;
import com.vaarta.meeting.model.MeetingStatus;
import com.vaarta.meeting.repository.MeetingRepository;
import com.vaarta.meeting.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

    /**
     * Capped rather than paginated: at current scale a pager would be dead code.
     * Revisit when the table realistically exceeds a few hundred rows.
     */
    private static final int MAX_MEETINGS = 500;

    private final MeetingRepository meetingRepository;
    private final MeetingService meetingService;

    /** The admin making the request, taken from the JWT rather than the payload. */
    private UUID currentAdminId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    /**
     * Retrieves meetings across the platform, newest first, regardless of status.
     *
     * @return the most recent meetings.
     */
    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings() {
        List<MeetingResponse> meetings = meetingRepository
                .findAll(PageRequest.of(0, MAX_MEETINGS, Sort.by("createdAt").descending()))
                .getContent()
                .stream()
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

            // Disconnecting everyone from a live call is consequential, so record
            // who did it. Only audited when the meeting was actually running —
            // re-ending an already-ended meeting is a no-op, not an action.
            meetingService.recordAdminAudit(
                    currentAdminId(), "MEETING_FORCE_ENDED", id,
                    "force-ended \"" + meeting.getTitle() + "\"");
        }

        return ResponseEntity.ok(MeetingResponse.from(meeting));
    }
}
