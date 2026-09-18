import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

const nodeWidth = 250;
const nodeHeight = 60;

export const ensureConnectedEdges = (nodes: Node[], edges: Edge[] = []): Edge[] => {
  if (nodes.length <= 1) return edges;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  // Filter only valid edges
  const validEdges: Edge[] = (edges || []).filter(
    e => e.source && e.target && e.source !== e.target && nodeMap.has(e.source) && nodeMap.has(e.target)
  );

  // If we already have a solid edge network covering the nodes, return it
  const connectedNodeIds = new Set<string>();
  validEdges.forEach(e => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
  if (disconnectedNodes.length === 0 && validEdges.length > 0) {
    return validEdges;
  }

  // We need to synthesize connections for disconnected or all nodes
  const newEdges: Edge[] = [...validEdges];
  const existingEdgeKeys = new Set(validEdges.map(e => `${e.source}->${e.target}`));

  const addEdgeSafe = (sourceId: string, targetId: string, label?: string) => {
    if (sourceId === targetId) return;
    const key = `${sourceId}->${targetId}`;
    if (!existingEdgeKeys.has(key)) {
      existingEdgeKeys.add(key);
      newEdges.push({
        id: `e-${sourceId}-${targetId}-${newEdges.length}`,
        source: sourceId,
        target: targetId,
        label: label || '',
        type: 'smoothstep',
        animated: true
      });
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    }
  };

  // Identify root / base node
  let rootNode = nodes.find(n => n.id === 'root' || n.data?.type === 'role' || n.data?.type === 'input');
  if (!rootNode) {
    rootNode = nodes[0];
  }

  // Identify phases vs topics vs concepts
  const phaseNodes = nodes.filter(n => n.id !== rootNode!.id && (n.data?.type === 'phase' || n.id.startsWith('phase')));
  const topicNodes = nodes.filter(n => n.id !== rootNode!.id && (n.data?.type === 'topic' || n.id.startsWith('topic')));
  const otherNodes = nodes.filter(n => n.id !== rootNode!.id && !phaseNodes.includes(n) && !topicNodes.includes(n));

  if (phaseNodes.length > 0) {
    // Connect root to all phase nodes
    phaseNodes.forEach(p => addEdgeSafe(rootNode!.id, p.id));

    // Connect topics to phases
    topicNodes.forEach((t, idx) => {
      const parentPhase = phaseNodes[idx % phaseNodes.length];
      addEdgeSafe(parentPhase.id, t.id);
    });

    // Connect other nodes to topics or phases
    otherNodes.forEach((o, idx) => {
      const parent = topicNodes.length > 0 ? topicNodes[idx % topicNodes.length] : phaseNodes[idx % phaseNodes.length];
      addEdgeSafe(parent.id, o.id);
    });
  } else if (topicNodes.length > 0) {
    // Connect root to first tier of topics, or in sequence
    const tierSize = Math.max(2, Math.ceil(Math.sqrt(topicNodes.length)));
    const firstTier = topicNodes.slice(0, tierSize);
    firstTier.forEach(t => addEdgeSafe(rootNode!.id, t.id));

    for (let i = tierSize; i < topicNodes.length; i++) {
      const parent = topicNodes[i - tierSize];
      addEdgeSafe(parent.id, topicNodes[i].id);
    }

    otherNodes.forEach((o, idx) => {
      const parent = topicNodes[idx % topicNodes.length];
      addEdgeSafe(parent.id, o.id);
    });
  } else {
    // Generic sequential or tree layout:
    // Root connects to first 2-3 nodes, and each connects to downstream nodes
    const children = nodes.filter(n => n.id !== rootNode!.id);
    if (children.length <= 4) {
      children.forEach(c => addEdgeSafe(rootNode!.id, c.id));
    } else {
      const branchCount = Math.min(3, Math.ceil(children.length / 3));
      const mainBranches = children.slice(0, branchCount);
      mainBranches.forEach(b => addEdgeSafe(rootNode!.id, b.id));

      for (let i = branchCount; i < children.length; i++) {
        const parent = children[i - branchCount];
        addEdgeSafe(parent.id, children[i].id);
      }
    }
  }

  return newEdges;
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  if (nodes.length === 0) return { nodes: [], edges: [] };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 90, ranksep: 130 });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  nodes.forEach((node) => {
    const w = node.measured?.width ?? 250;
    const h = node.measured?.height ?? 60;
    dagreGraph.setNode(node.id, { width: w, height: h });
  });

  const validEdges = (edges || []).filter(
    edge => edge.source && edge.target && nodeMap.has(edge.source) && nodeMap.has(edge.target)
  );

  validEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 };
    const w = node.measured?.width ?? 250;
    const h = node.measured?.height ?? 60;
    const newNode = {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: (nodeWithPosition.x || 0) - w / 2,
        y: (nodeWithPosition.y || 0) - h / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges: validEdges };
};

export interface RoadmapData {
  role: string;
  regionalInsight?: string;
  localResources?: string[];
  phases: {
    title: string;
    description: string;
    topics: {
      name: string;
      concepts: string[];
    }[];
  }[];
}

export function parseRoadmapToElements(data: RoadmapData): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const rootId = 'root';
  nodes.push({
    id: rootId,
    type: 'editable',
    data: { label: data.role, type: 'role' },
    position: { x: 0, y: 0 },
  });

  data.phases.forEach((phase, phaseIdx) => {
    const phaseId = `phase-${phaseIdx}`;
    nodes.push({
      id: phaseId,
      type: 'editable',
      data: { label: phase.title, type: 'phase' },
      position: { x: 0, y: 0 },
    });
    
    edges.push({
      id: `e-${rootId}-${phaseId}`,
      source: rootId,
      target: phaseId,
      type: 'smoothstep',
      animated: true,
    });

    phase.topics.forEach((topic, topicIdx) => {
      const topicId = `topic-${phaseIdx}-${topicIdx}`;
      nodes.push({
        id: topicId,
        type: 'editable',
        data: { label: topic.name, type: 'topic' },
        position: { x: 0, y: 0 },
      });

      edges.push({
        id: `e-${phaseId}-${topicId}`,
        source: phaseId,
        target: topicId,
        type: 'smoothstep',
      });

      topic.concepts.forEach((concept, conceptIdx) => {
        const conceptId = `concept-${phaseIdx}-${topicIdx}-${conceptIdx}`;
        nodes.push({
          id: conceptId,
          type: 'editable',
          data: { label: concept, type: 'concept' },
          position: { x: 0, y: 0 },
        });

        edges.push({
          id: `e-${topicId}-${conceptId}`,
          source: topicId,
          target: conceptId,
          type: 'smoothstep',
        });
      });
    });
  });

  return getLayoutedElements(nodes, edges);
}
