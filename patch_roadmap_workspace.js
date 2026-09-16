import fs from 'fs';

let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const handleMsgTarget = `const data = await apiClient.post<any>('/api/ai/Chat', { messages: [...chatMessages, userMsg], context: { role: initialRole } });
      if (data.error) throw new Error(data.error);
      setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);`;

const handleMsgReplace = `const data = await apiClient.post<any>('/api/ai/Chat', { 
        messages: [...chatMessages, userMsg], 
        context: { role: initialRole, nodes, edges } 
      });
      if (data.error) throw new Error(data.error);
      setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);
      
      if (data.actions && Array.isArray(data.actions)) {
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

content = content.replace(handleMsgTarget, handleMsgReplace);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
