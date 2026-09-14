import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

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
                        
                        // We also need to update the node's visual state!
                        setNodes(nds => nds.map(n => {
                          if (n.id === selectedNode.id) {
                            return { ...n, data: { ...n.data, isCompleted: isChecked } };
                          }
                          return n;
                        }));
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
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success: Inspector checkbox added");
} else {
  console.log("Failed: targetInspector not found");
}

