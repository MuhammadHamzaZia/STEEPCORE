const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

const loadOld = `  const loadBlueprint = async (id: string) => {
    setIsLoading(true);
    try {
      const bpNodes = await api.getNodesByBlueprintId(id);
      const initialNodes: Node[] = bpNodes.map(n => ({
        id: n.id,
        type: 'editable',
        position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
          label: n.label,
          type: n.type || 'topic',
          description: n.description || '',
          color: 'default'
        },
      }));
      setNodes(initialNodes);
      
      const mockEdges: Edge[] = [];
      for (let i = 0; i < bpNodes.length - 1; i++) {
        mockEdges.push({
          id: \`e-\${bpNodes[i].id}-\${bpNodes[i+1].id}\`,
          source: bpNodes[i].id,
          target: bpNodes[i+1].id,
          type: 'smoothstep',
          animated: true
        });
      }
      setEdges(mockEdges);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };`;

const loadNew = `  const loadBlueprint = async (id: string) => {
    setIsLoading(true);
    try {
      const bp = await api.getBlueprintById(id);
      if (bp) {
          const bpNodes = bp.nodes || [];
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
          }));
          setNodes(initialNodes);
          
          const bpEdges = bp.edges || [];
          const initialEdges: Edge[] = bpEdges.map((e: any) => ({
            id: String(e.id),
            source: String(e.sourceNodeId),
            target: String(e.targetNodeId),
            label: e.label || '',
            type: 'smoothstep',
            animated: true
          }));
          setEdges(initialEdges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };`;

code = code.replace(loadOld, loadNew);
fs.writeFileSync(file, code);
