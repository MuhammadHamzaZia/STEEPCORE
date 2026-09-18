import fs from 'fs';
let content = fs.readFileSync('src/lib/flow.ts', 'utf8');

content = content.replace(
  "  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });",
  "  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });"
);

content = content.replace(
  "    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });",
  "    const w = node.measured?.width ?? 250;\n    const h = node.measured?.height ?? 60;\n    dagreGraph.setNode(node.id, { width: w, height: h });"
);

content = content.replace(
  "        x: nodeWithPosition.x - nodeWidth / 2,\n        y: nodeWithPosition.y - nodeHeight / 2,",
  "        x: nodeWithPosition.x - (node.measured?.width ?? 250) / 2,\n        y: nodeWithPosition.y - (node.measured?.height ?? 60) / 2,"
);

fs.writeFileSync('src/lib/flow.ts', content);
