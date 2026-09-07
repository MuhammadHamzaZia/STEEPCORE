import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoadmapState {
  completedNodes: string[];
  progress: number;
}

interface LibraryStore {
  savedBlueprintIds: string[];
  activeRoadmaps: Record<string, RoadmapState>;
  toggleBookmark: (id: string) => void;
  markNodeCompleted: (blueprintId: string, nodeId: string, totalNodes: number) => void;
  resetProgress: (blueprintId: string) => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set) => ({
      savedBlueprintIds: [],
      activeRoadmaps: {},
      toggleBookmark: (id) => set((state) => ({
        savedBlueprintIds: state.savedBlueprintIds.includes(id)
          ? state.savedBlueprintIds.filter(savedId => savedId !== id)
          : [...state.savedBlueprintIds, id]
      })),
      markNodeCompleted: (blueprintId, nodeId, totalNodes) => set((state) => {
        const roadmap = state.activeRoadmaps[blueprintId] || { completedNodes: [], progress: 0 };
        const newCompletedNodes = roadmap.completedNodes.includes(nodeId)
          ? roadmap.completedNodes.filter(id => id !== nodeId)
          : [...roadmap.completedNodes, nodeId];
        
        const newProgress = Math.round((newCompletedNodes.length / totalNodes) * 100);
        
        return {
          activeRoadmaps: {
            ...state.activeRoadmaps,
            [blueprintId]: {
              completedNodes: newCompletedNodes,
              progress: newProgress
            }
          }
        };
      }),
      resetProgress: (blueprintId) => set((state) => {
        const newActiveRoadmaps = { ...state.activeRoadmaps };
        delete newActiveRoadmaps[blueprintId];
        return { activeRoadmaps: newActiveRoadmaps };
      })
    }),
    {
      name: 'steepcore-library',
    }
  )
);
