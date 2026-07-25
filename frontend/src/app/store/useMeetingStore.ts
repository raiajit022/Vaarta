import { create } from 'zustand';
import { meetingClient } from '../apiClient';

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
}

interface MeetingStore {
    meetings: Meeting[];
    isLoading: boolean;
    error: string | null;
    fetchMyMeetings: () => Promise<void>;
    createMeeting: (title: string, scheduledStart?: string) => Promise<Meeting>;
    joinMeeting: (joinCode: string) => Promise<Meeting>;
    fetchLiveKitToken: (meetingId: string) => Promise<{ token: string, livekitUrl: string }>;
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
    createMeeting: async (title: string, scheduledStart?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await meetingClient.post('/api/meetings', {
                title,
                scheduledStart
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
            // if we just joined a new meeting, refresh our meetings list or just add it if it's not there
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
    }
}));
