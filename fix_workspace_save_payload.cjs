const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

const edgesMapOld = `        edges: edges.map(e => ({
          source: e.source,
          target: e.target,
          label: e.label ? String(e.label) : ''
        }))`;

const edgesMapNew = `        edges: edges.map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          const targetNode = nodes.find(n => n.id === e.target);
          return {
            source: sourceNode ? sourceNode.data.label : e.source,
            target: targetNode ? targetNode.data.label : e.target,
            label: e.label ? String(e.label) : ''
          };
        })`;

code = code.replace(edgesMapOld, edgesMapNew);
fs.writeFileSync(file, code);
