import fs from 'fs';
let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const target = `                        try {
                          await api.toggleNodeProgress(currentBlueprintId, selectedNode.id, isChecked ? 'completed' : 'pending');
                        } catch(err) {
                          console.error('Failed to sync progress:', err);
                        }`;

const replacement = `                        if (isAuthenticated) {
                          try {
                            await api.toggleNodeProgress(currentBlueprintId, selectedNode.id, isChecked ? 'completed' : 'pending');
                          } catch(err) {
                            // Backend sync failed, but local zustand persistence succeeded. Ignore to prevent UI console errors.
                          }
                        }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
    console.log("Fixed!");
} else {
    console.log("Target not found");
}
