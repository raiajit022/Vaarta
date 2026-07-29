import { create } from 'zustand';
import { meetingClient } from '../apiClient';

/**
 * Represents a meeting entity from the backend.
 */
export interface Meeting {
    id: string;
    title: string;
    hostId: string;
    joinCode: string;
    status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
    scheduledStart: string | null;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
    summary?: string;
    actionItems?: string;
    sentimentLabel?: string;
    sentimentReason?: string;
    agenda?: string;
}

/**
 * Zustand store for managing the user's meetings state.
 * Handles fetching, creating, and joining meetings, as well as obtaining
 * LiveKit access tokens for active sessions.
 */
interface MeetingStore {
    meetings: Meeting[];
    isLoading: boolean;
    error: string | null;
    
    /** Fetches the list of meetings the current user is a part of. */
    fetchMyMeetings: () => Promise<void>;
    
    /** Creates a new meeting and optionally invites participants via email. */
    createMeeting: (title: string, scheduledStart?: string, participantEmails?: string[], agenda?: string[]) => Promise<Meeting>;
    
    /** Suggests an agenda based on a description */
    suggestAgenda: (description: string) => Promise<{title: string, agenda: string[]}>;
    
    /** Joins an existing meeting using its 9-character join code. */
    joinMeeting: (joinCode: string) => Promise<Meeting>;

    /** Generates the summary for an ended meeting */
    generateSummary: (meetingId: string) => Promise<Meeting>;

    /** Generates the action items for an ended meeting */
    generateActionItems: (meetingId: string) => Promise<Meeting>;
    
    /** Generates the sentiment for an ended meeting */
    generateSentiment: (meetingId: string) => Promise<Meeting>;
    
    /** Retrieves the LiveKit JWT and WebSocket URL required to connect to a meeting room. */
    fetchLiveKitToken: (meetingId: string) => Promise<{ token: string, livekitUrl: string }>;
    
    /** Sends a chat command to the bot. */
    sendBotCommand: (meetingId: string, message: string) => Promise<void>;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
    meetings: [],
    isLoading: false,
    error: null,
    fetchMyMeetings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.get('/api/meetings/me');
            set({ meetings: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch meetings', isLoading: false });
        }
    },
    createMeeting: async (title: string, scheduledStart?: string, participantEmails?: string[], agenda?: string[]) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post('/api/meetings', {
                title,
                scheduledStart,
                participantEmails,
                agenda
            });
            set((state) => ({ 
                meetings: [response.data, ...state.meetings],
                isLoading: false 
            }));
            return response.data;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to create meeting', isLoading: false });
            throw error;
        }
    },
    joinMeeting: async (joinCode: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post(`/api/meetings/join/${joinCode}`);
            // If we successfully joined a new meeting, append it to our local state cache
            set((state) => {
                const existing = state.meetings.find(m => m.id === response.data.id);
                if (!existing) {
                    return { meetings: [response.data, ...state.meetings], isLoading: false };
                }
                return { isLoading: false };
            });
            return response.data;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to join meeting', isLoading: false });
            throw error;
        }
    },
    fetchLiveKitToken: async (meetingId: string) => {
        try {
            const response = await meetingClient.get(`/api/meetings/${meetingId}/livekit-token`);
            return response.data; // { token, livekitUrl }
        } catch (error: any) {
            console.error("Failed to fetch livekit token", error);
            throw error;
        }
    },
    generateSummary: async (meetingId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post(`/api/meetings/${meetingId}/summary:generate`);
            // Update the meeting in local state
            set((state) => ({
                meetings: state.meetings.map(m => m.id === meetingId ? response.data : m),
                isLoading: false
            }));
            return response.data;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to generate summary', isLoading: false });
            throw error;
        }
    },
    generateActionItems: async (meetingId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post(`/api/meetings/${meetingId}/action-items:generate`);
            // Update the meeting in local state
            set((state) => ({
                meetings: state.meetings.map(m => m.id === meetingId ? response.data : m),
                isLoading: false
            }));
            return response.data;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to generate action items', isLoading: false });
            throw error;
        }
    },
    generateSentiment: async (meetingId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post(`/api/meetings/${meetingId}/sentiment:generate`);
            // Update the meeting in local state
            set((state) => ({
                meetings: state.meetings.map(m => m.id === meetingId ? response.data : m),
                isLoading: false
            }));
            return response.data;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to generate sentiment', isLoading: false });
            throw error;
        }
    },
    sendBotCommand: async (meetingId: string, message: string) => {
        try {
            await meetingClient.post(`/api/meetings/${meetingId}/chat/bot`, { message });
        } catch (error: any) {
            console.error("Failed to send bot command", error);
            // We don't necessarily want to throw and crash the UI for a chat command failure
        }
    },
    suggestAgenda: async (description: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post('/api/meetings/suggest-agenda', { description });
            set({ isLoading: false });
            return response.data; // { title: string, agenda: string[] }
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to suggest agenda', isLoading: false });
            throw error;
        }
    }
}));
