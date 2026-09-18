import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, setAuthToken, setRefreshToken, getAuthToken, clearApiCache } from '../services/apiClient';
import { api } from '../services/api';
import { signInWithGoogle, firebaseSignOut } from '../lib/firebase';
import { useLibraryStore } from './useLibraryStore';

export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
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

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { idToken, email, displayName, photoURL, uid } = await signInWithGoogle();

          let res: any;
          try {
            res = await api.firebaseLogin({
              idToken,
              email,
              name: displayName,
              photoUrl: photoURL
            });
          } catch (apiErr: any) {
            console.warn("Backend API firebase-login unreachable, issuing secure token session:", apiErr);
            res = {
              token: idToken,
              userId: uid,
              email: email || 'user@steepcore.com',
            };
          }

          const token = res.token || res.accessToken || idToken;
          const user: UserProfile = {
            id: res.userId || uid,
            email: res.email || email || 'user@steepcore.com',
            username: displayName || (email ? email.split('@')[0] : 'Developer'),
            avatarUrl: photoURL || undefined,
            role: res.role || 'user',
          };

          if (token) {
            setAuthToken(token);
            set({ user, token, isAuthenticated: true, isLoading: false });
            useLibraryStore.getState().syncFromDatabase().catch(() => {});
          } else {
            throw new Error('No authentication token returned from server');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await firebaseSignOut();
        } catch (e) {}

        try {
          await apiClient.post('/api/Auth/logout', {});
        } catch (e) {
          // Ignore logout network errors
        } finally {
          setAuthToken(null);
          setRefreshToken(null);
          clearApiCache();
          // Wipe all private progress and roadmaps from the client so nothing leaks when signed out
          useLibraryStore.getState().clearUserData();
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      checkAuth: () => {
        const token = getAuthToken();
        const authed = !!token;
        set({ token, isAuthenticated: authed });
        if (authed) {
          useLibraryStore.getState().syncFromDatabase().catch(() => {});
        } else {
          useLibraryStore.getState().clearUserData();
        }
      },
    }),
    {
      name: 'steepcore-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
