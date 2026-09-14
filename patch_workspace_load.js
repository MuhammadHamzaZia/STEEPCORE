import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const targetStoreMethods = `  const { activeRoadmaps, markNodeCompleted } = useLibraryStore();`;
const replaceStoreMethods = `  const { activeRoadmaps, markNodeCompleted, setRoadmapState, initializeRoadmap } = useLibraryStore();`;

const targetLoadBP = `      const bp = await api.getBlueprintById(id);
      if (bp) {
          setSaveTitle(bp.title || initialRole || 'Custom Roadmap');`;

const replaceLoadBP = `      const bp = await api.getBlueprintById(id);
      if (bp) {
          try {
            if (isAuthenticated) {
              const progressData = await api.getUserProgress(id);
              if (progressData && Array.isArray(progressData)) {
                const completedNodes = progressData.filter(p => p.status === 'completed').map(p => p.nodeId);
                const progressPct = bp.nodesCount ? Math.round((completedNodes.length / bp.nodesCount) * 100) : 0;
                setRoadmapState(id, completedNodes, progressPct);
              }
            }
          } catch(e) {
            console.error("Failed to load progress", e);
          }
          setSaveTitle(bp.title || initialRole || 'Custom Roadmap');`;

if (code.includes(targetStoreMethods)) {
  code = code.replace(targetStoreMethods, replaceStoreMethods);
  code = code.replace(targetLoadBP, replaceLoadBP);
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success: RoadmapWorkspace patched load");
}
