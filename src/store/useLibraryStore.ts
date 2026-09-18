import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAuthToken } from '../services/apiClient';
import { api } from '../services/api';
import { useUIStore } from './useUIStore';

export interface RoadmapState {
  completedNodes: string[];
  progress: number;
}

interface LibraryStore {
  savedBlueprintIds: string[];
  activeRoadmaps: Record<string, RoadmapState>;
  toggleBookmark: (id: string) => void;
  markNodeCompleted: (blueprintId: string, nodeId: string, totalNodes: number) => void;
  initializeRoadmap: (blueprintId: string) => void;
  setRoadmapState: (blueprintId: string, completedNodes: string[], progress: number) => void;
  resetProgress: (blueprintId: string) => Promise<void>;
  clearUserData: () => void;
  syncFromDatabase: () => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      savedBlueprintIds: [],
      activeRoadmaps: {},

      clearUserData: () => {
        set({ savedBlueprintIds: [], activeRoadmaps: {} });
        try {
          localStorage.removeItem('steepcore-library');
        } catch {}
      },

      syncFromDatabase: async () => {
        const token = getAuthToken();
        if (!token) {
          get().clearUserData();
          return;
        }

        try {
          const summary = await api.getUserProgressSummary();
          if (Array.isArray(summary) && summary.length > 0) {
            const roadmaps: Record<string, RoadmapState> = { ...get().activeRoadmaps };
            for (const item of summary) {
              const bId = String(item.blueprintId);
              const completed = Array.isArray(item.completedNodes) ? item.completedNodes.map(String) : [];
              const prev = roadmaps[bId];
              const totalEstimate = prev ? Math.max(prev.completedNodes.length, completed.length, 1) : Math.max(completed.length, 1);
              roadmaps[bId] = {
                completedNodes: completed,
                progress: Math.min(100, Math.round((completed.length / totalEstimate) * 100))
              };
            }
            set({ activeRoadmaps: roadmaps });
          }
        } catch (e) {
          console.warn('[LibraryStore] Failed to sync progress from database:', e);
        }
      },

      toggleBookmark: (id) => {
        const token = getAuthToken();
        if (!token) {
          useUIStore.getState().setIsAuthModalOpen(true);
          return;
        }

        set((state) => ({
          savedBlueprintIds: state.savedBlueprintIds.includes(id)
            ? state.savedBlueprintIds.filter(savedId => savedId !== id)
            : [...state.savedBlueprintIds, id]
        }));
      },

      initializeRoadmap: (blueprintId) => {
        const token = getAuthToken();
        if (!token) {
          // Unauthenticated users cannot create persistent active roadmaps
          return;
        }

        set((state) => {
          if (!state.activeRoadmaps[blueprintId]) {
            return {
              activeRoadmaps: {
                ...state.activeRoadmaps,
                [blueprintId]: { completedNodes: [], progress: 0 }
              }
            };
          }
          return state;
        });
      },

      setRoadmapState: (blueprintId, completedNodes, progress) => {
        const token = getAuthToken();
        if (!token) return;

        set((state) => ({
          activeRoadmaps: {
            ...state.activeRoadmaps,
            [blueprintId]: { completedNodes, progress }
          }
        }));
      },

      markNodeCompleted: (blueprintId, nodeId, totalNodes) => {
        const token = getAuthToken();
        if (!token) {
          useUIStore.getState().setIsAuthModalOpen(true);
          return;
        }

        const roadmap = get().activeRoadmaps[blueprintId] || { completedNodes: [], progress: 0 };
        const isRemoving = roadmap.completedNodes.includes(nodeId);
        const newCompletedNodes = isRemoving
          ? roadmap.completedNodes.filter(id => id !== nodeId)
          : [...roadmap.completedNodes, nodeId];
        
        const effectiveTotal = Math.max(totalNodes, newCompletedNodes.length, 1);
        const newProgress = Math.round((newCompletedNodes.length / effectiveTotal) * 100);
        
        set((state) => ({
          activeRoadmaps: {
            ...state.activeRoadmaps,
            [blueprintId]: {
              completedNodes: newCompletedNodes,
              progress: newProgress
            }
          }
        }));

        // Sync with backend API
        api.toggleNodeProgress(blueprintId, nodeId, isRemoving ? 'pending' : 'completed').catch((err) => {
          console.warn('[LibraryStore] Backend toggle sync failed:', err);
        });
      },

      resetProgress: async (blueprintId) => {
        set((state) => {
          const newActiveRoadmaps = { ...state.activeRoadmaps };
          delete newActiveRoadmaps[blueprintId];
          return { activeRoadmaps: newActiveRoadmaps };
        });

        const token = getAuthToken();
        if (token) {
          try {
            await api.resetUserProgress(blueprintId);
          } catch (err) {
            console.warn('[LibraryStore] Failed to reset database progress:', err);
          }
        }
      }
    }),
    {
      name: 'steepcore-library',
      onRehydrateStorage: () => (state) => {
        // If not authenticated, ensure no stale active roadmaps or saved blueprints are shown
        const token = getAuthToken();
        if (!token && state) {
          state.clearUserData();
        }
      }
    }
  )
);

