package com.vaarta.meeting.service;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class LiveKitTokenService {

    @Value("${livekit.api.key:devkey}")
    private String apiKey;

    @Value("${livekit.api.secret:devsecret}")
    private String apiSecret;

    public String generateToken(UUID meetingId, UUID userId, String userName, boolean isHost) {
        AccessToken token = new AccessToken(apiKey, apiSecret);

        token.setName(userName);
        token.setIdentity(userId.toString());

        token.addGrants(new RoomJoin(true), new RoomName(meetingId.toString()));
        
        return token.toJwt();
    }
}
