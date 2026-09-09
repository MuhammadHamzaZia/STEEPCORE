import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, setAuthToken, setRefreshToken, getAuthToken } from '../services/apiClient';

export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getAuthToken(),
      isAuthenticated: !!getAuthToken(),
      isLoading: false,

      login: async (emailOrUsername, password) => {
        set({ isLoading: true });
        try {
          const res: any = await apiClient.post('/api/Auth/login', {
            email: emailOrUsername,
            username: emailOrUsername,
            password,
          });

          const token = res.token || res.accessToken || res.jwt;
          const refreshToken = res.refreshToken;
          const user: UserProfile = res.user || {
            email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@steepcore.com`,
            username: res.username || emailOrUsername.split('@')[0],
            role: res.role || 'user',
          };

          if (token) {
            setAuthToken(token);
            if (refreshToken) setRefreshToken(refreshToken);
            set({ user, token, isAuthenticated: true, isLoading: false });
          } else {
            throw new Error('No token returned from server');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

            register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          await apiClient.post('/api/Auth/register', {
            username,
            fullName: username,
            email,
            password,
          });

          // After registration, auto-login or prompt login
          await get().login(email, password);
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/api/Auth/logout', {});
        } catch (e) {
          // Ignore logout network errors
        } finally {
          setAuthToken(null);
          setRefreshToken(null);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      checkAuth: () => {
        const token = getAuthToken();
        set({ token, isAuthenticated: !!token });
      },
    }),
    {
      name: 'steepcore-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
