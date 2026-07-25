import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserInfo {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  // User Data
  user: UserInfo | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: UserInfo) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
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
    }),
    {
      name: 'vaarta-auth-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
