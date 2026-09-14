import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// 1. Import useLibraryStore
if (!code.includes('useLibraryStore')) {
  code = code.replace(
    "import { useAuthStore } from '../store/useAuthStore';",
    "import { useAuthStore } from '../store/useAuthStore';\nimport { useLibraryStore } from '../store/useLibraryStore';"
  );
}

// 2. Fetch active roadmaps
const targetStoreDestructure = `  const { currentBlueprintId, setIsAuthModalOpen } = useUIStore();`;
const replaceStoreDestructure = `  const { currentBlueprintId, setIsAuthModalOpen } = useUIStore();
  const { activeRoadmaps, markNodeCompleted } = useLibraryStore();`;
if (code.includes(targetStoreDestructure)) {
  code = code.replace(targetStoreDestructure, replaceStoreDestructure);
}

// 3. Mark Node Completed inside the Inspector
// First find the "Delete Node" button container to append
const targetInspector = `              <div className="pt-4 border-t border-border-default">
                <button 
                  onClick={deleteSelected}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-danger-fg hover:bg-danger-fg/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Node
                </button>
              </div>`;

const replaceInspector = `              {currentBlueprintId && activeRoadmaps[currentBlueprintId] && (
                <div className="pt-4 border-t border-border-default">
                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-canvas-inset rounded-md transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-border-default text-action-primary focus:ring-action-primary"
                      checked={activeRoadmaps[currentBlueprintId]?.completedNodes?.includes(selectedNode.id) || false}
                      onChange={async (e) => {
                        const isChecked = e.target.checked;
                        markNodeCompleted(currentBlueprintId, selectedNode.id, nodes.length);
                        try {
                          await api.toggleNodeProgress(currentBlueprintId, selectedNode.id, isChecked ? 'completed' : 'pending');
                        } catch(err) {
                          console.error('Failed to sync progress:', err);
                        }
                      }}
                    />
                    <span className="text-sm font-medium text-fg-default">Mark as Completed</span>
                  </label>
                </div>
              )}
              
              <div className="pt-4 border-t border-border-default">
                <button 
                  onClick={deleteSelected}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-danger-fg hover:bg-danger-fg/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Node
                </button>
              </div>`;

if (code.includes(targetInspector)) {
  code = code.replace(targetInspector, replaceInspector);
}

// 4. We need to pass isCompleted to node.data
const targetNodeEffect = `  useEffect(() => {
    if (nodes.length > 0) {
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === selectedNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: nodeLabel,
              },
            };
          }
          return node;
        })
      );
    }
  }, [nodeLabel]);`;

// But wait, it's better to update nodes generally, or just intercept them in ReactFlow 'nodes' prop.
const targetReactFlow = `<ReactFlow
            nodes={nodes}
            edges={edges}`;

const replaceReactFlow = `<ReactFlow
            nodes={nodes.map(n => ({
              ...n,
              data: {
                ...n.data,
                isCompleted: currentBlueprintId && activeRoadmaps[currentBlueprintId]?.completedNodes?.includes(n.id)
              }
            }))}
            edges={edges}`;

if (code.includes(targetReactFlow)) {
  code = code.replace(targetReactFlow, replaceReactFlow);
}

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
console.log("Success: RoadmapWorkspace patched");
