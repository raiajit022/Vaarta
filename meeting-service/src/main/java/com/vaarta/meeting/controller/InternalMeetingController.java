package com.vaarta.meeting.controller;

import com.vaarta.meeting.model.ChatMessage;
import com.vaarta.meeting.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/meetings")
@RequiredArgsConstructor
public class InternalMeetingController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/{id}/chats")
    public ResponseEntity<List<ChatMessage>> getMeetingChats(@PathVariable UUID id) {
        List<ChatMessage> chats = chatMessageRepository.findByMeetingIdOrderBySentAtAsc(id);
        return ResponseEntity.ok(chats);
    }
}
