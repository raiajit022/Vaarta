package com.vaarta.meeting.controller;

import com.vaarta.meeting.service.LiveKitTokenService;
import io.livekit.server.RoomServiceClient;
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

    @Value("${livekit.api.key:devkey}")
    private String apiKey;

    @Value("${livekit.api.secret:devsecret}")
    private String apiSecret;

    @Value("${livekit.url:ws://localhost:7880}")
    private String livekitUrl;

    /**
     * Generates a signed LiveKit token for the authenticated user to join the specified meeting.
     *
     * @param id          the UUID of the meeting/room.
     * @param userId      the UUID of the user requesting the token.
     * @param userDetails the authenticated user's details.
     * @return a map containing the JWT token and the LiveKit WebSocket URL.
     */
    @GetMapping("/livekit-token")
    public ResponseEntity<Map<String, String>> getLiveKitToken(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id") String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Default to participant role; host validation is handled in the meeting flow.
        boolean isHost = false;

        String token = liveKitTokenService.generateToken(id, UUID.fromString(userId), userDetails.getUsername(), isHost);

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
            @PathVariable String participantId,
            @RequestHeader(value = "X-User-Id") String hostUserId) throws IOException {
        
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
}
