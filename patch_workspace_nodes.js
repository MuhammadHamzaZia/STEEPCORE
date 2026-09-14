import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const targetLoadBP = `      const bp = await api.getBlueprintById(id);
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
          setSaveTitle(bp.title || initialRole || 'Custom Roadmap');
          setSaveDesc(bp.description || '');
          setSavePrice(bp.price || 0);
          setIsPublic(bp.isPublished || false);
          
          const bpNodes = (bp as any).nodes || [];
          const initialNodes: Node[] = bpNodes.map((n: any) => ({
            id: String(n.id),
            type: 'editable',
            position: { x: n.positionX || Math.random() * 500, y: n.positionY || Math.random() * 500 },
            data: {
              label: n.label,
              type: n.type || 'topic',
              description: n.description || '',
              color: 'default'
            },
          }));`;

const replaceLoadBP = `      const bp = await api.getBlueprintById(id);
      if (bp) {
          let fetchedCompletedNodes: string[] = [];
          try {
            if (isAuthenticated) {
              const progressData = await api.getUserProgress(id);
              if (progressData && Array.isArray(progressData)) {
                fetchedCompletedNodes = progressData.filter(p => p.status === 'completed').map(p => p.nodeId);
                const progressPct = bp.nodesCount ? Math.round((fetchedCompletedNodes.length / bp.nodesCount) * 100) : 0;
                setRoadmapState(id, fetchedCompletedNodes, progressPct);
              }
            }
          } catch(e) {
            console.error("Failed to load progress", e);
          }
          setSaveTitle(bp.title || initialRole || 'Custom Roadmap');
          setSaveDesc(bp.description || '');
          setSavePrice(bp.price || 0);
          setIsPublic(bp.isPublished || false);
          
          const bpNodes = (bp as any).nodes || [];
          const initialNodes: Node[] = bpNodes.map((n: any) => ({
            id: String(n.id),
            type: 'editable',
            position: { x: n.positionX || Math.random() * 500, y: n.positionY || Math.random() * 500 },
            data: {
              label: n.label,
              type: n.type || 'topic',
              description: n.description || '',
              color: 'default',
              isCompleted: fetchedCompletedNodes.includes(String(n.id))
            },
          }));`;

if (code.includes(targetLoadBP)) {
  code = code.replace(targetLoadBP, replaceLoadBP);
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success: initialNodes patched");
} else {
  console.log("Failed: targetLoadBP not found");
}
