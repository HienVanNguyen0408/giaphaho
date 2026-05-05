import type { Node, Edge } from '@xyflow/react';
import type { Member } from '@/types';
import dagre from 'dagre';

interface MemberNodeData extends Record<string, unknown> {
  member: Member;
}

export interface FlowGraph {
  nodes: Node<MemberNodeData>[];
  edges: Edge[];
}

const nodeWidth = 200;
const nodeHeight = 120;

/**
 * Convert a flat array of Members into ReactFlow nodes and edges
 * using Dagre for automatic hierarchical layout.
 */
export function flatToFlowGraph(members: Member[]): FlowGraph {
  if (members.length === 0) {
    return { nodes: [], edges: [] };
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set layout direction (Top to Bottom)
  // ranksep: distance between levels
  // nodesep: distance between nodes on same level
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 });

  const nodes: Node<MemberNodeData>[] = [];
  const edges: Edge[] = [];
  const memberMap = new Map<string, Member>(members.map((m) => [m.id, m]));

  // Add nodes to dagre
  members.forEach((m) => {
    dagreGraph.setNode(m.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre
  members.forEach((m) => {
    if (m.parentId && memberMap.has(m.parentId)) {
      dagreGraph.setEdge(m.parentId, m.id);
      edges.push({
        id: `e-${m.parentId}-${m.id}`,
        source: m.parentId,
        target: m.id,
        type: 'smoothstep', // Looks nicer for family trees
        animated: false,
        style: { stroke: '#f87171', strokeWidth: 2 },
      });
    }
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get positioned nodes
  members.forEach((m) => {
    const nodeWithPosition = dagreGraph.node(m.id);
    nodes.push({
      id: m.id,
      position: {
        // Dagre uses center of node, React Flow uses top left by default
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: { member: m },
      type: 'memberNode',
    });
  });

  return { nodes, edges };
}
