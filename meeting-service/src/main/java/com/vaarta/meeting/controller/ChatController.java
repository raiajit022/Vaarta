package com.vaarta.meeting.controller;

import com.vaarta.meeting.dto.ChatMessageRequest;
import com.vaarta.meeting.dto.ChatMessageResponse;
import com.vaarta.meeting.model.ChatMessage;
import com.vaarta.meeting.model.MeetingParticipant;
import com.vaarta.meeting.repository.ChatMessageRepository;
import com.vaarta.meeting.repository.MeetingParticipantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meetings/{id}/chat")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final MeetingParticipantRepository participantRepository;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          MeetingParticipantRepository participantRepository) {
        this.chatMessageRepository = chatMessageRepository;
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

    @GetMapping
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        verifyParticipant(id, userId);

        List<ChatMessageResponse> messages = chatMessageRepository.findByMeetingIdOrderBySentAtAsc(id)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<ChatMessageResponse> postMessage(@PathVariable UUID id, @RequestBody ChatMessageRequest request) {
        UUID userId = getCurrentUserId();
        verifyParticipant(id, userId);

        ChatMessage message = new ChatMessage();
        message.setMeetingId(id);
        message.setSenderId(userId);
        message.setContent(request.getContent());
        message.setSentAt(ZonedDateTime.now());

        message = chatMessageRepository.save(message);

        return ResponseEntity.ok(mapToResponse(message));
    }

    private ChatMessageResponse mapToResponse(ChatMessage message) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());
        response.setMeetingId(message.getMeetingId());
        response.setSenderId(message.getSenderId());
        response.setContent(message.getContent());
        response.setSentAt(message.getSentAt());
        return response;
    }
}
