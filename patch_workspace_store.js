import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const target1 = `  const { setIsAuthModalOpen } = useUIStore();`;
const replace1 = `  const { setIsAuthModalOpen } = useUIStore();
  const { activeRoadmaps, markNodeCompleted, setRoadmapState, initializeRoadmap } = useLibraryStore();`;

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success: Added useLibraryStore destructuring");
} else {
  console.log("Failed: target1 not found");
}

const target2 = `      const bp = await api.getBlueprintById(id);
      if (bp) {
          setSaveTitle(bp.title || initialRole || 'Custom Roadmap');`;

const replace2 = `      const bp = await api.getBlueprintById(id);
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

if (code.includes(target2)) {
  code = code.replace(target2, replace2);
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success: Added getUserProgress logic");
} else {
  console.log("Failed: target2 not found");
}

