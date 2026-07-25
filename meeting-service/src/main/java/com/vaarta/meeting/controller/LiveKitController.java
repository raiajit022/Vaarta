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

    @GetMapping("/livekit-token")
    public ResponseEntity<Map<String, String>> getLiveKitToken(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id") String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // In a real app we'd query the DB to see if this user is host or participant
        // For simplicity, we assume they have access if they can call this endpoint
        boolean isHost = false; // Could check if user is the one who created it

        String token = liveKitTokenService.generateToken(id, UUID.fromString(userId), userDetails.getUsername(), isHost);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "livekitUrl", livekitUrl
        ));
    }

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
