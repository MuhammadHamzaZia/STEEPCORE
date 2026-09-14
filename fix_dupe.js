import fs from 'fs';
let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const regex = /{currentBlueprintId && activeRoadmaps\[currentBlueprintId\] && \([\s\S]*?Mark as Completed[\s\S]*?<\/label>\s*<\/div>\s*\)}/g;

const matches = code.match(regex);
if (matches && matches.length > 1) {
  // Replace the first match with empty string
  code = code.replace(matches[0], '');
}

// Remove setNodes for isCompleted since ReactFlow rendering handles it directly via mapping
const setNodesTarget = `// We also need to update the node's visual state!
                        setNodes(nds => nds.map(n => {
                          if (n.id === selectedNode.id) {
                            return { ...n, data: { ...n.data, isCompleted: isChecked } };
                          }
                          return n;
                        }));`;
code = code.replace(setNodesTarget, '');

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
console.log("Success: Duplication and setNodes removed");
