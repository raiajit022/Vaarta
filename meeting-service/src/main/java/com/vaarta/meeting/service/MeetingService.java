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

/**
 * Core business logic for meetings.
 *
 * <p>Handles the creation of meetings, generating unique join codes,
 * managing participant lists, and integrating with the notification-service
 * for asynchronous email invites.
 */
@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final JoinCodeGenerator joinCodeGenerator;
    private final org.springframework.web.client.RestClient restClient;
    private final org.springframework.web.client.RestClient aiRestClient;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    public MeetingService(MeetingRepository meetingRepository,
                          MeetingParticipantRepository participantRepository,
                          JoinCodeGenerator joinCodeGenerator,
                          org.springframework.web.client.RestClient.Builder restClientBuilder,
                          @org.springframework.beans.factory.annotation.Value("${app.notification-service-url}") String notificationServiceUrl,
                          @org.springframework.beans.factory.annotation.Value("${app.ai-service-url}") String aiServiceUrl,
                          @org.springframework.beans.factory.annotation.Value("${app.internal-api-key}") String internalApiKey) {
        this.meetingRepository = meetingRepository;
        this.participantRepository = participantRepository;
        this.joinCodeGenerator = joinCodeGenerator;
        this.restClient = restClientBuilder.clone()
                .baseUrl(notificationServiceUrl)
                .defaultHeader("X-Internal-Key", internalApiKey)
                .build();
        this.aiRestClient = restClientBuilder.clone()
                .baseUrl(aiServiceUrl)
                .defaultHeader("X-Internal-Key", internalApiKey)
                .build();
    }

    /**
     * Creates a new meeting and optionally sends out email invitations asynchronously.
     *
     * @param request the meeting details (title, scheduled time, participant emails).
     * @param hostId  the UUID of the user creating the meeting.
     * @return the created meeting details.
     */
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

    /**
     * Retrieves all meetings associated with a user (as a host or participant).
     *
     * @param userId the UUID of the user.
     * @return a list of meetings.
     */
    public List<MeetingResponse> getMyMeetings(UUID userId) {
        // Find meetings where user is a participant or host
        List<MeetingParticipant> participations = participantRepository.findByUserId(userId);
        return participations.stream()
                .map(MeetingParticipant::getMeeting)
                .distinct()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the details of a specific meeting.
     *
     * @param id the UUID of the meeting.
     * @return the meeting details.
     * @throws RuntimeException if the meeting is not found.
     */
    public MeetingResponse getMeeting(UUID id) {
        return meetingRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
    }

    /**
     * Validates a join code and adds the user as a participant to the meeting.
     *
     * @param joinCode the 9-character code for the meeting.
     * @param userId   the UUID of the user joining.
     * @return the meeting details.
     * @throws RuntimeException if the meeting does not exist, or is cancelled/ended.
     */
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

    /**
     * Ends a meeting. Only the host is permitted to end their own meeting.
     *
     * @param id     the UUID of the meeting.
     * @param userId the UUID of the user attempting to end the meeting.
     * @throws RuntimeException if the user is not the host.
     */
    @Transactional
    public void endMeeting(UUID id, UUID userId) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!meeting.getHostId().equals(userId)) {
            throw new RuntimeException("Only the host can end the meeting");
        }

        meeting.setStatus(MeetingStatus.ENDED);
        meeting.setEndedAt(ZonedDateTime.now());
        meetingRepository.save(meeting);
    }

    @Transactional
    public MeetingResponse generateSummary(UUID id, UUID userId) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        // Anyone who was a participant can generate summary, or just host.
        // Let's check participant
        participantRepository.findByMeetingIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("User is not a participant of this meeting"));

        if (meeting.getStatus() != MeetingStatus.ENDED) {
            throw new RuntimeException("Can only summarize completed meetings");
        }

        try {
            java.util.Map<String, Object> response = aiRestClient.post()
                    .uri("/agents/invoke")
                    .body(java.util.Map.of(
                            "agentType", "SUMMARIZER",
                            "meetingId", id.toString()
                    ))
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {});

            if (response != null && response.containsKey("summary")) {
                meeting.setSummary((String) response.get("summary"));
                meeting = meetingRepository.save(meeting);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate summary: " + e.getMessage());
        }

        return MeetingResponse.from(meeting);
    }

    @Transactional
    public MeetingResponse generateActionItems(UUID id, UUID userId) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        participantRepository.findByMeetingIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("User is not a participant of this meeting"));

        if (meeting.getStatus() != MeetingStatus.ENDED) {
            throw new RuntimeException("Can only extract action items from completed meetings");
        }

        try {
            java.util.Map<String, Object> response = aiRestClient.post()
                    .uri("/agents/invoke")
                    .body(java.util.Map.of(
                            "agentType", "ACTION_ITEMS",
                            "meetingId", id.toString()
                    ))
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {});

            if (response != null && response.containsKey("actionItems")) {
                meeting.setActionItems((String) response.get("actionItems"));
                meeting = meetingRepository.save(meeting);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate action items: " + e.getMessage());
        }

        return MeetingResponse.from(meeting);
    }

    private MeetingResponse mapToResponse(Meeting meeting) {
        return MeetingResponse.from(meeting);
    }
}
