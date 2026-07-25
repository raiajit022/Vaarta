package com.vaarta.meeting.service;

import com.vaarta.meeting.dto.CreateMeetingRequest;
import com.vaarta.meeting.dto.MeetingResponse;
import com.vaarta.meeting.model.Meeting;
import com.vaarta.meeting.model.MeetingParticipant;
import com.vaarta.meeting.model.MeetingStatus;
import com.vaarta.meeting.repository.MeetingParticipantRepository;
import com.vaarta.meeting.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final JoinCodeGenerator joinCodeGenerator;
    private final org.springframework.web.client.RestClient restClient;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    public MeetingService(MeetingRepository meetingRepository,
                          MeetingParticipantRepository participantRepository,
                          JoinCodeGenerator joinCodeGenerator,
                          org.springframework.web.client.RestClient.Builder restClientBuilder,
                          @org.springframework.beans.factory.annotation.Value("${app.notification-service-url}") String notificationServiceUrl,
                          @org.springframework.beans.factory.annotation.Value("${app.internal-api-key}") String internalApiKey) {
        this.meetingRepository = meetingRepository;
        this.participantRepository = participantRepository;
        this.joinCodeGenerator = joinCodeGenerator;
        this.restClient = restClientBuilder
                .baseUrl(notificationServiceUrl)
                .defaultHeader("X-Internal-Key", internalApiKey)
                .build();
    }

    @Transactional
    public MeetingResponse createMeeting(CreateMeetingRequest request, UUID hostId) {
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setHostId(hostId);
        meeting.setScheduledStart(request.getScheduledStart());
        
        // Generate unique join code
        String joinCode;
        do {
            joinCode = joinCodeGenerator.generate();
        } while (meetingRepository.findByJoinCode(joinCode).isPresent());
        meeting.setJoinCode(joinCode);

        // If it's an instant meeting (no scheduled start), start it now
        if (request.getScheduledStart() == null || request.getScheduledStart().isBefore(ZonedDateTime.now().plusMinutes(1))) {
            meeting.setStatus(MeetingStatus.LIVE);
            meeting.setStartedAt(ZonedDateTime.now());
        }

        meeting = meetingRepository.save(meeting);

        // Add host as participant
        MeetingParticipant hostParticipant = new MeetingParticipant();
        hostParticipant.setMeeting(meeting);
        hostParticipant.setUserId(hostId);
        hostParticipant.setRole("HOST");
        hostParticipant.setJoinedAt(ZonedDateTime.now());
        participantRepository.save(hostParticipant);

        if (request.getParticipantEmails() != null && !request.getParticipantEmails().isEmpty()) {
            final String link = frontendUrl + "/join/" + joinCode;
            final String title = request.getTitle();
            final UUID mId = meeting.getId();
            
            // Send notifications asynchronously
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                for (String email : request.getParticipantEmails()) {
                    try {
                        restClient.post()
                                .uri("/api/notifications/meeting-invite")
                                .body(java.util.Map.of(
                                        "recipientEmail", email.trim(),
                                        "meetingTitle", title,
                                        "joinLink", link,
                                        "meetingId", mId
                                ))
                                .retrieve()
                                .toBodilessEntity();
                    } catch (Exception e) {
                        System.err.println("Failed to send invite to " + email + ": " + e.getMessage());
                    }
                }
            });
        }

        return mapToResponse(meeting);
    }

    public List<MeetingResponse> getMyMeetings(UUID userId) {
        // Find meetings where user is a participant or host
        List<MeetingParticipant> participations = participantRepository.findByUserId(userId);
        return participations.stream()
                .map(MeetingParticipant::getMeeting)
                .distinct()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MeetingResponse getMeeting(UUID id) {
        return meetingRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
    }

    @Transactional
    public MeetingResponse joinMeeting(String joinCode, UUID userId) {
        Meeting meeting = meetingRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (meeting.getStatus() == MeetingStatus.CANCELLED || meeting.getStatus() == MeetingStatus.ENDED) {
            throw new RuntimeException("Meeting is no longer active");
        }

        // Add participant if not already joined
        if (participantRepository.findByMeetingIdAndUserId(meeting.getId(), userId).isEmpty()) {
            MeetingParticipant participant = new MeetingParticipant();
            participant.setMeeting(meeting);
            participant.setUserId(userId);
            participant.setRole("PARTICIPANT");
            participant.setJoinedAt(ZonedDateTime.now());
            participantRepository.save(participant);
        }

        return mapToResponse(meeting);
    }

    @Transactional
    public void endMeeting(UUID id, UUID userId) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!meeting.getHostId().equals(userId)) {
            throw new RuntimeException("Only host can end the meeting");
        }

        meeting.setStatus(MeetingStatus.ENDED);
        meeting.setEndedAt(ZonedDateTime.now());
        meetingRepository.save(meeting);
    }

    private MeetingResponse mapToResponse(Meeting meeting) {
        MeetingResponse response = new MeetingResponse();
        response.setId(meeting.getId());
        response.setTitle(meeting.getTitle());
        response.setHostId(meeting.getHostId());
        response.setJoinCode(meeting.getJoinCode());
        response.setStatus(meeting.getStatus());
        response.setScheduledStart(meeting.getScheduledStart());
        response.setStartedAt(meeting.getStartedAt());
        response.setEndedAt(meeting.getEndedAt());
        response.setCreatedAt(meeting.getCreatedAt());
        return response;
    }
}
