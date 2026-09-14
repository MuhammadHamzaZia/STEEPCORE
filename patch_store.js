import fs from 'fs';

let code = fs.readFileSync('src/store/useLibraryStore.ts', 'utf8');

const targetMethod = `  markNodeCompleted: (blueprintId: string, nodeId: string, totalNodes: number) => void;`;
const replaceMethod = `  markNodeCompleted: (blueprintId: string, nodeId: string, totalNodes: number) => void;
  initializeRoadmap: (blueprintId: string) => void;
  setRoadmapState: (blueprintId: string, completedNodes: string[], progress: number) => void;`;

const targetImpl = `      markNodeCompleted: (blueprintId, nodeId, totalNodes) => set((state) => {`;
const replaceImpl = `      initializeRoadmap: (blueprintId) => set((state) => {
        if (!state.activeRoadmaps[blueprintId]) {
          return {
            activeRoadmaps: {
              ...state.activeRoadmaps,
              [blueprintId]: { completedNodes: [], progress: 0 }
            }
          };
        }
        return state;
      }),
      setRoadmapState: (blueprintId, completedNodes, progress) => set((state) => ({
        activeRoadmaps: {
          ...state.activeRoadmaps,
          [blueprintId]: { completedNodes, progress }
        }
      })),
      markNodeCompleted: (blueprintId, nodeId, totalNodes) => set((state) => {`;

if (code.includes(targetMethod)) {
  code = code.replace(targetMethod, replaceMethod);
  code = code.replace(targetImpl, replaceImpl);
  fs.writeFileSync('src/store/useLibraryStore.ts', code);
  console.log("Success: Store patched");
}
