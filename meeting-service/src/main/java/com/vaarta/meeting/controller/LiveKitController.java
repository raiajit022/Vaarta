package com.vaarta.meeting.controller;

import com.vaarta.meeting.service.LiveKitTokenService;
import com.vaarta.meeting.service.MeetingService;
import io.livekit.server.RoomServiceClient;
import livekit.LivekitModels.DataPacket;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import retrofit2.Response;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for integrating with the LiveKit WebRTC server.
 *
 * <p>Handles the generation of secure access tokens that clients need
 * to connect to a specific LiveKit room, and provides administrative
 * actions like kicking participants from a room.
 */
@RestController
@RequestMapping("/api/meetings/{id}")
@RequiredArgsConstructor
public class LiveKitController {

    private final LiveKitTokenService liveKitTokenService;
    private final MeetingService meetingService;
    private final ObjectMapper objectMapper;

    @Value("${livekit.api.key:devkey}")
    private String apiKey;

    @Value("${livekit.api.secret:devsecret}")
    private String apiSecret;

    @Value("${livekit.url:ws://localhost:7880}")
    private String livekitUrl;

    private String getCurrentUserId() {
        return (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /**
     * Generates a signed LiveKit token for the authenticated user to join the specified meeting.
     *
     * @param id          the UUID of the meeting/room.
     * @return a map containing the JWT token and the LiveKit WebSocket URL.
     */
    @GetMapping("/livekit-token")
    public ResponseEntity<Map<String, String>> getLiveKitToken(@PathVariable UUID id) {
        
        String userId = getCurrentUserId();
        // Default to participant role; host validation is handled in the meeting flow.
        boolean isHost = false;

        String token = liveKitTokenService.generateToken(id, UUID.fromString(userId), "User", isHost);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "livekitUrl", livekitUrl
        ));
    }

    /**
     * Removes a participant from an active LiveKit room.
     * This uses the LiveKit Server SDK to communicate directly with the LiveKit server's HTTP API.
     *
     * @param id            the UUID of the meeting/room.
     * @param participantId the LiveKit participant identity to remove.
     * @param hostUserId    the UUID of the host requesting the removal (for audit/validation).
     * @return HTTP 200 OK on success, or an error status from the LiveKit server.
     * @throws IOException if the HTTP call to the LiveKit server fails.
     */
    @PostMapping("/remove-participant/{participantId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID id,
            @PathVariable String participantId) throws IOException {
        
        String hostUserId = getCurrentUserId();
        // We need the http/https url for RoomServiceClient, not ws/wss
        String httpUrl = livekitUrl.replace("ws://", "http://").replace("wss://", "https://");
        RoomServiceClient client = RoomServiceClient.createClient(httpUrl, apiKey, apiSecret);

        Response<Void> response = client.removeParticipant(id.toString(), participantId).execute();
        
        if (response.isSuccessful()) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(response.code()).build();
        }
    }

    /**
     * Accepts a chat command, invokes the AI service, and broadcasts the response to the LiveKit room.
     */
    @PostMapping("/chat/bot")
    public ResponseEntity<Void> handleChatCommand(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) throws IOException {
        
        String userId = getCurrentUserId();
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 1. Invoke the AI Service
        String aiResponse = meetingService.invokeChatCommand(id, UUID.fromString(userId), message);

        if (aiResponse == null || aiResponse.isEmpty()) {
            return ResponseEntity.ok().build();
        }

        // 2. Broadcast to LiveKit
        String httpUrl = livekitUrl.replace("ws://", "http://").replace("wss://", "https://");
        RoomServiceClient client = RoomServiceClient.createClient(httpUrl, apiKey, apiSecret);

        // Construct the JSON payload for the chat message
        String msgId = UUID.randomUUID().toString();
        long timestamp = System.currentTimeMillis();
        
        Map<String, Object> chatData = Map.of(
                "id", msgId,
                "message", aiResponse,
                "timestamp", timestamp
        );
        
        String jsonPayload = objectMapper.writeValueAsString(chatData);
        byte[] data = jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        // 3. Send via Data Channel
        Response<Void> response = client.sendData(
                id.toString(),
                data,
                DataPacket.Kind.RELIABLE,
                java.util.Collections.emptyList(),
                java.util.Collections.emptyList(),
                "lk-chat-topic"
        ).execute();

        if (response.isSuccessful()) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(response.code()).build();
        }
    }
}
