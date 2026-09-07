import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

const nodeWidth = 250;
const nodeHeight = 60;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
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
