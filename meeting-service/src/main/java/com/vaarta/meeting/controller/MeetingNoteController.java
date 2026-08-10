package com.vaarta.meeting.controller;

import com.vaarta.meeting.model.MeetingNote;
import com.vaarta.meeting.repository.MeetingNoteRepository;
import com.vaarta.meeting.repository.MeetingParticipantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Shared notes for a meeting.
 *
 * <p>Mirrors {@link ChatController}: participation is verified on every call, so a
 * user cannot read or write the notes of a meeting they are not part of.
 *
 * <p>Concurrency is deliberately last-write-wins. Operational transforms or CRDTs
 * would be a large amount of machinery for a panel a handful of people type into
 * during a single call.
 */
@RestController
@RequestMapping("/api/meetings/{id}/notes")
public class MeetingNoteController {

    private final MeetingNoteRepository noteRepository;
    private final MeetingParticipantRepository participantRepository;

    public MeetingNoteController(MeetingNoteRepository noteRepository,
                                 MeetingParticipantRepository participantRepository) {
        this.noteRepository = noteRepository;
        this.participantRepository = participantRepository;
    }

    private UUID getCurrentUserId() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userIdStr);
    }

    private void verifyParticipant(UUID meetingId, UUID userId) {
        participantRepository.findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("User is not a participant of this meeting"));
    }

    /** Returns the note document, or an empty one if nobody has written yet. */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotes(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        verifyParticipant(id, userId);

        MeetingNote note = noteRepository.findById(id).orElseGet(() -> {
            MeetingNote empty = new MeetingNote();
            empty.setMeetingId(id);
            return empty;
        });

        return ResponseEntity.ok(Map.of(
                "content", note.getContent() == null ? "" : note.getContent(),
                "updatedAt", note.getUpdatedAt()
        ));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> saveNotes(@PathVariable UUID id,
                                                        @RequestBody Map<String, String> body) {
        UUID userId = getCurrentUserId();
        verifyParticipant(id, userId);

        MeetingNote note = noteRepository.findById(id).orElseGet(() -> {
            MeetingNote created = new MeetingNote();
            created.setMeetingId(id);
            return created;
        });

        note.setContent(body.getOrDefault("content", ""));
        note.setUpdatedBy(userId);
        note.setUpdatedAt(ZonedDateTime.now());
        note = noteRepository.save(note);

        return ResponseEntity.ok(Map.of(
                "content", note.getContent(),
                "updatedAt", note.getUpdatedAt()
        ));
    }
}
