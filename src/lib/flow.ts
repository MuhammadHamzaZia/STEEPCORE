import dagre from 'dagre';
import { Node, Edge, Position, MarkerType } from '@xyflow/react';

const nodeWidth = 220;
const nodeHeight = 60;

// Resolves and maps edges to valid node IDs regardless of whether
// raw edges used node IDs, node labels, index numbers, or different casing.
export const resolveAndSyncEdges = (nodes: Node[], rawEdges: any[] = []): Edge[] => {
  if (!nodes || nodes.length === 0) return [];

  const idMap = new Map<string, string>();
  const labelMap = new Map<string, string>();
  const indexMap = new Map<number, string>();

  nodes.forEach((node, idx) => {
    const rawId = String(node.id).trim();
    idMap.set(rawId, node.id);
    idMap.set(rawId.toLowerCase(), node.id);

    const label = String(node.data?.label || '').trim().toLowerCase();
    if (label) {
      labelMap.set(label, node.id);
    }

    indexMap.set(idx, node.id);
    idMap.set(String(idx), node.id);
    idMap.set(`node-${idx}`, node.id);
    idMap.set(`step-${idx}`, node.id);
  });

  const resolveId = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    if (!s) return null;

    if (idMap.has(s)) return idMap.get(s)!;
    if (idMap.has(s.toLowerCase())) return idMap.get(s.toLowerCase())!;
    if (labelMap.has(s.toLowerCase())) return labelMap.get(s.toLowerCase())!;

    const num = Number(s);
    if (!isNaN(num) && indexMap.has(num)) return indexMap.get(num)!;

    return null;
  };

  const resolvedEdges: Edge[] = [];
  const seenPairs = new Set<string>();

  (rawEdges || []).forEach((e: any, idx: number) => {
    const sourceVal = e.source ?? e.sourceNodeId;
    const targetVal = e.target ?? e.targetNodeId;

    const sourceId = resolveId(sourceVal);
    const targetId = resolveId(targetVal);

    if (sourceId && targetId && sourceId !== targetId) {
      const pairKey = `${sourceId}->${targetId}`;
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        resolvedEdges.push({
          id: String(e.id || `e-${sourceId}-${targetId}-${idx}`),
          source: sourceId,
          target: targetId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          label: e.label || e.relationshipLabel || '',
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: '#388bfd',
          },
          style: { stroke: '#388bfd', strokeWidth: 2 },
        });
      }
    }
  });

  return resolvedEdges;
};

export const ensureConnectedEdges = (nodes: Node[], rawEdges: any[] = []): Edge[] => {
  if (nodes.length <= 1) return [];

  const validEdges = resolveAndSyncEdges(nodes, rawEdges);
  
  // Identify root / base node
  let rootNode = nodes.find(n => n.id === 'root' || n.id === 'root-start' || n.id === 'node-0' || n.data?.type === 'role' || n.data?.type === 'input');
  if (!rootNode) {
    rootNode = nodes[0];
  }

  // Classify nodes into structural categories
  const phaseNodes = nodes.filter(n => n.id !== rootNode!.id && (
    n.data?.type === 'phase' || 
    n.id.toLowerCase().startsWith('phase') ||
    (typeof n.data?.label === 'string' && /phase\s*\d+/i.test(n.data.label))
  ));
  
  // Sort phase nodes in chronological sequence
  phaseNodes.sort((a, b) => {
    const labelA = String(a.data?.label || a.id);
    const labelB = String(b.data?.label || b.id);
    const matchA = labelA.match(/\d+/);
    const matchB = labelB.match(/\d+/);
    if (matchA && matchB) {
      return parseInt(matchA[0], 10) - parseInt(matchB[0], 10);
    }
    return nodes.indexOf(a) - nodes.indexOf(b);
  });

  const topicNodes = nodes.filter(n => n.id !== rootNode!.id && !phaseNodes.some(p => p.id === n.id));

  // If we have phases, build a clean, pure Parent-Child Tree Hierarchy:
  // Root (Level 0 Parent) -> Phases (Level 1 Children of Root, Parents of Topics)
  // Phases -> Topics (Level 2 Children of respective Phase)
  // No convergence from topics into subsequent phases!
  if (phaseNodes.length > 0) {
    const structuredEdges: Edge[] = [];
    const seenEdges = new Set<string>();

    const addSafe = (sourceId: string, targetId: string, label?: string) => {
      if (sourceId === targetId) return;
      const key = `${sourceId}->${targetId}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        structuredEdges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          label: label || '',
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: '#388bfd',
          },
          style: { stroke: '#388bfd', strokeWidth: 2 },
        });
      }
    };

    // 1. Root connects directly to each Phase node (Parent -> Children)
    phaseNodes.forEach((phaseNode, idx) => {
      addSafe(rootNode!.id, phaseNode.id, idx === 0 ? "Start" : "");
    });

    // 2. Group topic nodes under their respective phases
    const phaseChildrenMap = new Map<string, Node[]>();
    phaseNodes.forEach(p => phaseChildrenMap.set(p.id, []));
    const claimedTopicIds = new Set<string>();

    // First, map explicit phase -> topic edges from AI if available
    validEdges.forEach(e => {
      if (phaseChildrenMap.has(e.source) && !phaseNodes.some(p => p.id === e.target) && e.target !== rootNode?.id) {
        const topic = topicNodes.find(t => t.id === e.target);
        if (topic && !claimedTopicIds.has(topic.id)) {
          phaseChildrenMap.get(e.source)!.push(topic);
          claimedTopicIds.add(topic.id);
        }
      }
    });

    // Assign remaining topics sequentially by their appearance in the nodes array
    let activePhaseId = phaseNodes[0].id;
    nodes.forEach(node => {
      if (phaseChildrenMap.has(node.id)) {
        activePhaseId = node.id;
      } else if (node.id !== rootNode?.id && !claimedTopicIds.has(node.id)) {
        phaseChildrenMap.get(activePhaseId)!.push(node);
        claimedTopicIds.add(node.id);
      }
    });

    // 3. Connect each Phase to its own topics ONLY (Parent -> Child leaves)
    phaseNodes.forEach((phaseNode) => {
      const topics = phaseChildrenMap.get(phaseNode.id) || [];
      topics.forEach(t => addSafe(phaseNode.id, t.id));
    });

    return structuredEdges;
  }

  // Fallback for non-phased node collections
  const connectedNodeIds = new Set<string>();
  validEdges.forEach(e => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
  if (disconnectedNodes.length === 0 && validEdges.length > 0) {
    return validEdges;
  }

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
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#388bfd',
        },
        style: { stroke: '#388bfd', strokeWidth: 2 },
      });
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    }
  };

  if (topicNodes.length > 0) {
    const pillarCount = Math.min(3, Math.max(2, Math.ceil(topicNodes.length / 3)));
    const primaryTopics = topicNodes.slice(0, pillarCount);
    primaryTopics.forEach(t => addEdgeSafe(rootNode!.id, t.id));

    for (let i = pillarCount; i < topicNodes.length; i++) {
      const parent = primaryTopics[i % pillarCount];
      addEdgeSafe(parent.id, topicNodes[i].id);
    }
  } else {
    const nonRootNodes = nodes.filter(n => n.id !== rootNode!.id);
    const branchCount = Math.min(3, Math.max(2, Math.ceil(nonRootNodes.length / 3)));
    const mainBranches = nonRootNodes.slice(0, branchCount);
    mainBranches.forEach(b => addEdgeSafe(rootNode!.id, b.id));

    for (let i = branchCount; i < nonRootNodes.length; i++) {
      const parent = mainBranches[i % branchCount];
      addEdgeSafe(parent.id, nonRootNodes[i].id);
    }
  }

  return newEdges;
};

// Guarantees that any roadmap has EXACTLY ONE starting point node at the root/origin.
// If multiple nodes have no incoming edges (in-degree 0), a unified Start Point node is synthesized
// and connected to all entry nodes, establishing a pristine single origin hierarchy.
export const ensureSingleStartingPoint = (
  nodes: Node[],
  rawEdges: any[] = [],
  roadmapTitle?: string
): { nodes: Node[]; edges: Edge[] } => {
  if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };

  const resolvedEdges = resolveAndSyncEdges(nodes, rawEdges);
  
  // Calculate in-degree (how many incoming edges each node has)
  const inDegree = new Map<string, number>();
  nodes.forEach(n => inDegree.set(n.id, 0));
  resolvedEdges.forEach(e => {
    if (inDegree.has(e.target)) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  // Entry nodes have in-degree 0 (no prerequisites pointing to them)
  const entryNodes = nodes.filter(n => (inDegree.get(n.id) || 0) === 0);

  // Check if there is already a designated single root node
  const existingRoleNode = nodes.find(n => 
    n.id === 'root' || 
    n.id === 'root-start' || 
    n.data?.type === 'role' || 
    n.data?.type === 'start'
  );

  let finalNodes = [...nodes];
  let finalEdges = [...resolvedEdges];

  if (existingRoleNode) {
    // If the role node already exists, ensure it is the ONLY origin by connecting it to any other entry nodes
    entryNodes.forEach((node, idx) => {
      if (node.id !== existingRoleNode.id) {
        const edgeId = `e-${existingRoleNode.id}-${node.id}`;
        if (!finalEdges.some(e => e.source === existingRoleNode.id && e.target === node.id)) {
          finalEdges.push({
            id: edgeId,
            source: existingRoleNode.id,
            target: node.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            label: idx === 0 ? 'Start' : 'Prerequisite',
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#388bfd' },
            style: { stroke: '#388bfd', strokeWidth: 2 }
          });
        }
      }
    });
  } else if (entryNodes.length === 1 && typeof entryNodes[0].data?.label === 'string' && entryNodes[0].data.label.toLowerCase().includes('roadmap')) {
    // Single entry node that already acts as the roadmap title/header
    entryNodes[0].data.type = 'role';
  } else {
    // There are multiple entry nodes or no designated role node.
    // Create an explicit, prominent single starting point node!
    const cleanTitle = roadmapTitle || 'Career & Mastery Pathway';
    const rootId = 'root-start';
    const rootNode: Node = {
      id: rootId,
      type: 'editable',
      position: { x: 0, y: 0 },
      data: {
        label: cleanTitle,
        type: 'role',
        description: `Starting Point for ${cleanTitle}. Follow the curriculum from foundational prerequisites through advanced mastery.`,
        color: 'sky'
      }
    };

    finalNodes = [rootNode, ...finalNodes];

    entryNodes.forEach((entryNode, idx) => {
      finalEdges.unshift({
        id: `e-${rootId}-${entryNode.id}`,
        source: rootId,
        target: entryNode.id,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        label: idx === 0 ? 'Start' : 'Prerequisite',
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#388bfd' },
        style: { stroke: '#388bfd', strokeWidth: 2 }
      });
    });
  }

  // Run ensureConnectedEdges to ensure there are no disconnected nodes in deeper subgraphs
  const connectedEdges = ensureConnectedEdges(finalNodes, finalEdges);

  return { nodes: finalNodes, edges: connectedEdges };
};

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  if (nodes.length === 0) return { nodes: [], edges: [] };

  const isHorizontal = direction === 'LR';
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Standardize handles and edge presentation for tree hierarchy with clean readable badges
  const validEdges = edges.filter(
    edge => edge.source && edge.target && nodeMap.has(edge.source) && nodeMap.has(edge.target)
  ).map(edge => ({
    ...edge,
    sourceHandle: isHorizontal ? 'right' : 'bottom',
    targetHandle: isHorizontal ? 'left' : 'top',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: '#388bfd',
    },
    style: {
      stroke: '#388bfd',
      strokeWidth: 2,
      ...edge.style,
    },
    label: edge.label || '',
    labelStyle: {
      fill: '#c9d1d9',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    labelBgStyle: {
      fill: '#161b22',
      stroke: '#30363d',
      strokeWidth: 1,
      rx: 6,
      ry: 6,
    },
    labelBgPadding: [6, 3] as [number, number],
  }));

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 50 : 80,
    ranksep: isHorizontal ? 120 : 135,
    ranker: 'tight-tree',
  });

  nodes.forEach((node) => {
    const isRole = node.id === 'root' || node.id === 'root-start' || node.id === 'node-0' || node.data?.type === 'role';
    const isPhase = node.data?.type === 'phase' || /phase/i.test(node.id) || (typeof node.data?.label === 'string' && /phase/i.test(node.data.label));
    const labelLen = typeof node.data?.label === 'string' ? node.data.label.length : 15;
    
    // Provide realistic node bounding box to Dagre so ranks never overlap vertically or horizontally
    const w = (node.measured?.width && node.measured.width > 50) ? node.measured.width : (isRole ? 290 : isPhase ? 270 : 250);
    const h = (node.measured?.height && node.measured.height > 30) ? node.measured.height : (isRole ? 82 : isPhase ? 76 : (labelLen > 35 ? 84 : 68));
    dagreGraph.setNode(node.id, { width: w, height: h });
  });

  validEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Position nodes based on Dagre's computed parent-child layout
  const positionedNodes: Node[] = nodes.map((node) => {
    const dNode = dagreGraph.node(node.id) || { x: 0, y: 0 };
    const isRole = node.id === 'root' || node.id === 'root-start' || node.id === 'node-0' || node.data?.type === 'role';
    const isPhase = node.data?.type === 'phase' || /phase/i.test(node.id) || (typeof node.data?.label === 'string' && /phase/i.test(node.data.label));
    const labelLen = typeof node.data?.label === 'string' ? node.data.label.length : 15;
    const w = (node.measured?.width && node.measured.width > 50) ? node.measured.width : (isRole ? 290 : isPhase ? 270 : 250);
    const h = (node.measured?.height && node.measured.height > 30) ? node.measured.height : (isRole ? 82 : isPhase ? 76 : (labelLen > 35 ? 84 : 68));

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: Math.round(dNode.x - w / 2),
        y: Math.round(dNode.y - h / 2),
      },
    };
  });

  return { nodes: positionedNodes, edges: validEdges };
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
      data: { label: `Phase ${phaseIdx + 1}: ${phase.title}`, type: 'phase' },
      position: { x: 0, y: 0 },
    });
    
    // Parent-Child tree: Root connects directly to each Phase
    edges.push({
      id: `e-${rootId}-${phaseId}`,
      source: rootId,
      target: phaseId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      label: phaseIdx === 0 ? 'Start' : '',
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

      // Parent-Child tree: Phase connects directly to each child topic
      edges.push({
        id: `e-${phaseId}-${topicId}`,
        source: phaseId,
        target: topicId,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        type: 'smoothstep',
      });
    });
  });

  return getLayoutedElements(nodes, edges, 'TB');
}

