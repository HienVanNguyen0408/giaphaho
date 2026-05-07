import type { Node, Edge } from '@xyflow/react';
import type { Member } from '@/types';
import dagre from 'dagre';

export interface MemberNodeData extends Record<string, unknown> {
  member: Member;
  descendantsAchievementsCount: number;
}

export interface FlowGraph {
  nodes: Node<MemberNodeData>[];
  edges: Edge[];
}

const nodeWidth = 200;
const nodeHeight = 140;

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

  // Build children adjacency list
  const childrenOf = new Map<string, string[]>();
  members.forEach((m) => {
    if (m.parentId && memberMap.has(m.parentId)) {
      if (!childrenOf.has(m.parentId)) childrenOf.set(m.parentId, []);
      childrenOf.get(m.parentId)!.push(m.id);
    }
  });

  // Compute total achievements of all descendants (BFS)
  const getDescendantsAchievements = (id: string): number => {
    let total = 0;
    const queue = childrenOf.get(id) ? [...childrenOf.get(id)!] : [];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const cid = queue.shift()!;
      if (seen.has(cid)) continue;
      seen.add(cid);
      const m = memberMap.get(cid);
      if (m) {
        total += m.achievements?.length ?? 0;
        const grandChildren = childrenOf.get(cid);
        if (grandChildren) queue.push(...grandChildren);
      }
    }
    return total;
  };

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
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: { member: m, descendantsAchievementsCount: getDescendantsAchievements(m.id) },
      type: 'memberNode',
    });
  });

  return { nodes, edges };
}

export function getLineageMembers(targetId: string, allMembers: Member[]): Member[] {
  const lineageIds = new Set<string>([targetId]);

  // Walk up ancestor chain
  let currentId: string | null = targetId;
  while (currentId) {
    const member = allMembers.find((m) => m.id === currentId);
    const parentId = member?.parentId ?? null;
    if (parentId && !lineageIds.has(parentId)) {
      lineageIds.add(parentId);
      currentId = parentId;
    } else {
      break;
    }
  }

  // BFS down descendants
  const queue = [targetId];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const m of allMembers) {
      if (m.parentId === id && !lineageIds.has(m.id)) {
        lineageIds.add(m.id);
        queue.push(m.id);
      }
    }
  }

  return allMembers.filter((m) => lineageIds.has(m.id));
}
