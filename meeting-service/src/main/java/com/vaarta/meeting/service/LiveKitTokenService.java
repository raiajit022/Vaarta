package com.vaarta.meeting.service;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for generating LiveKit access tokens.
 *
 * <p>LiveKit requires clients to connect using a JWT that grants them specific permissions
 * (e.g., room join, publish audio/video, etc.). This service uses the LiveKit Server SDK
 * to generate these signed tokens.
 */
@Service
public class LiveKitTokenService {

    @Value("${livekit.api.key:devkey}")
    private String apiKey;

    @Value("${livekit.api.secret:devsecret}")
    private String apiSecret;

    /**
     * Generates a signed JWT for a user to join a specific LiveKit room.
     *
     * @param meetingId the UUID of the meeting, which acts as the LiveKit room name.
     * @param userId    the UUID of the user, used as the LiveKit participant identity.
     * @param userName  the display name of the user.
     * @param isHost    whether the user is the host (can be used to grant additional permissions).
     * @return a signed JWT string.
     */
    public String generateToken(UUID meetingId, UUID userId, String userName, boolean isHost) {
        AccessToken token = new AccessToken(apiKey, apiSecret);

        token.setName(userName);
        token.setIdentity(userId.toString());

        // Basic permissions: allow joining the specific room.
        // We can add publisher/subscriber permissions here if needed.
        token.addGrants(new RoomJoin(true), new RoomName(meetingId.toString()));
        
        return token.toJwt();
    }
}
