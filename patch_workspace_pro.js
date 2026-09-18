import fs from 'fs';
let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

content = content.replace(
  /<ReactFlow\n/g,
  '<ReactFlow\n            proOptions={{ hideAttribution: true }}\n'
);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
