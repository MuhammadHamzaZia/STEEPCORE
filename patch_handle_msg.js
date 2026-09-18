import fs from 'fs';
let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const target = `      if (data.actions && Array.isArray(data.actions)) {
        let newNodes = [...nodes];
        data.actions.forEach((action: any) => {
          if (action.type === 'ADD_NODE') {
            const newNodeId = \`node-\${Date.now()}-\${Math.random().toString(36).substr(2, 5)}\`;
            const newNode = {
              id: newNodeId,
              type: 'editable',
              data: { label: action.node.title, type: action.node.type || 'topic', description: action.node.description || '' },
              position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 }
            };
            setNodes((nds) => { newNodes = [...nds, newNode]; return newNodes; });
            if (action.sourceNodeId) {
              setEdges((eds) => [...eds, {
                id: \`e-\${action.sourceNodeId}-\${newNodeId}\`,
                source: action.sourceNodeId,
                target: newNodeId,
                type: 'smoothstep',
                animated: true
              }]);
            }
          } else if (action.type === 'UPDATE_NODE') {
            setNodes((nds) => nds.map(n => {
              if (n.id === action.nodeId || n.data.label.toLowerCase() === action.nodeId.toLowerCase()) {
                return { ...n, data: { ...n.data, ...action.updates } };
              }
              return n;
            }));
          } else if (action.type === 'DELETE_NODE') {
            setNodes((nds) => nds.filter(n => n.id !== action.nodeId && n.data.label.toLowerCase() !== action.nodeId.toLowerCase()));
            setEdges((eds) => eds.filter(e => e.source !== action.nodeId && e.target !== action.nodeId));
          }
        });
      }`;

const replacement = `      if (data.actions && Array.isArray(data.actions)) {
        let currentNodes = reactFlowInstance.getNodes();
        let currentEdges = reactFlowInstance.getEdges();
        let needsLayout = false;

        data.actions.forEach((action: any) => {
          if (action.type === 'ADD_NODE') {
            const newNodeId = \`node-\${Date.now()}-\${Math.random().toString(36).substr(2, 5)}\`;
            const newNode = {
              id: newNodeId,
              type: 'editable',
              data: { label: action.node.title, type: action.node.type || 'topic', description: action.node.description || '' },
              position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 }
            };
            currentNodes = [...currentNodes, newNode];
            if (action.sourceNodeId) {
              currentEdges = [...currentEdges, {
                id: \`e-\${action.sourceNodeId}-\${newNodeId}\`,
                source: action.sourceNodeId,
                target: newNodeId,
                type: 'smoothstep',
                animated: true
              }];
            }
          } else if (action.type === 'ADD_MULTIPLE_NODES') {
            needsLayout = true;
            if (Array.isArray(action.nodes)) {
               const newNodesList = action.nodes.map((n: any) => ({
                 id: String(n.id),
                 type: 'editable',
                 data: { label: n.title, type: n.type || 'topic', description: n.description || '' },
                 position: { x: 0, y: 0 }
               }));
               const newEdgesList = action.nodes
                 .filter((n: any) => n.sourceNodeId)
                 .map((n: any) => ({
                   id: \`e-\${n.sourceNodeId}-\${n.id}\`,
                   source: String(n.sourceNodeId),
                   target: String(n.id),
                   type: 'smoothstep',
                   animated: true
                 }));
               currentNodes = [...currentNodes, ...newNodesList];
               currentEdges = [...currentEdges, ...newEdgesList];
            }
          } else if (action.type === 'UPDATE_NODE') {
            currentNodes = currentNodes.map(n => {
              if (n.id === action.nodeId || n.data.label.toLowerCase() === action.nodeId.toLowerCase()) {
                return { ...n, data: { ...n.data, ...action.updates } };
              }
              return n;
            });
          } else if (action.type === 'DELETE_NODE') {
            currentNodes = currentNodes.filter(n => n.id !== action.nodeId && n.data.label.toLowerCase() !== action.nodeId.toLowerCase());
            currentEdges = currentEdges.filter(e => e.source !== action.nodeId && e.target !== action.nodeId);
          }
        });

        if (needsLayout) {
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(currentNodes, currentEdges, 'TB');
          currentNodes = layoutedNodes;
          currentEdges = layoutedEdges;
          setTimeout(() => reactFlowInstance.fitView({ duration: 800, padding: 0.2 }), 50);
        }

        setNodes(currentNodes);
        setEdges(currentEdges);
      }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
    console.log("Workspace patched successfully");
} else {
    console.error("Workspace target not found");
}
