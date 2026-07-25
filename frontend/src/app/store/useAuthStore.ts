import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userClient } from '../apiClient';

/**
 * Represents the authenticated user's profile and JWT claims.
 */
export interface UserInfo {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  emailVerified: boolean;
  avatarUrl?: string;
  organization?: string;
  timezone?: string;
}

/**
 * Zustand store state and actions for managing authentication.
 */
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;

  /** Updates the entire authentication state upon successful login/registration. */
  setAuth: (accessToken: string, refreshToken: string, user: UserInfo) => void;
  
  /** Updates the JWT tokens, typically used after a token refresh. */
  setTokens: (accessToken: string, refreshToken: string) => void;
  
  /** Updates the user profile data. */
  setUser: (user: UserInfo) => void;
  
  /** Clears the authentication state. */
  logout: () => void;
  
  /** Fetches extended profile data from the user-service and merges it into the local state. */
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
        
      fetchProfile: async () => {
        try {
          const response = await userClient.get('/api/users/me');
          const profile = response.data;
          set((s) => {
            if (s.user) {
              return {
                user: {
                  ...s.user,
                  fullName: profile.displayName,
                  avatarUrl: profile.avatarUrl,
                  organization: profile.organization,
                  timezone: profile.timezone,
                }
              };
            }
            return {};
          });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
    }),
    {
      name: 'vaarta-auth-storage',
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
