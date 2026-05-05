import type { Node, Edge } from '@xyflow/react';
import type { Member } from '@/types';

interface MemberNodeData extends Record<string, unknown> {
  member: Member;
}

export interface FlowGraph {
  nodes: Node<MemberNodeData>[];
  edges: Edge[];
}

/**
 * Convert a flat array of Members into ReactFlow nodes and edges.
 * Layout: horizontal tree — each generation level is a row, spaced 200px vertically.
 * Siblings within a level are spaced 220px apart horizontally.
 */
export function flatToFlowGraph(members: Member[]): FlowGraph {
  if (members.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Build a map for quick lookup
  const memberMap = new Map<string, Member>(members.map((m) => [m.id, m]));

  // Assign depth (generation level) to each member via BFS from roots
  const depth = new Map<string, number>();
  const roots = members.filter((m) => !m.parentId || !memberMap.has(m.parentId));

  // BFS
  const queue: { id: string; d: number }[] = roots.map((m) => ({ id: m.id, d: 0 }));
  while (queue.length > 0) {
    const { id, d } = queue.shift()!;
    if (depth.has(id)) continue;
    depth.set(id, d);
    // Find children
    for (const m of members) {
      if (m.parentId === id && !depth.has(m.id)) {
        queue.push({ id: m.id, d: d + 1 });
      }
    }
  }

  // Group members by depth level
  const levelMap = new Map<number, Member[]>();
  for (const m of members) {
    const d = depth.get(m.id) ?? 0;
    if (!levelMap.has(d)) levelMap.set(d, []);
    levelMap.get(d)!.push(m);
  }

  // Build nodes: position each member based on its level and sibling index
  const nodes: Node<MemberNodeData>[] = [];
  for (const [level, levelMembers] of levelMap.entries()) {
    const totalWidth = (levelMembers.length - 1) * 220;
    const startX = -totalWidth / 2;
    levelMembers.forEach((m, idx) => {
      nodes.push({
        id: m.id,
        position: {
          x: startX + idx * 220,
          y: level * 200,
        },
        data: { member: m },
        type: 'memberNode',
      });
    });
  }

  // Build edges
  const edges: Edge[] = [];
  for (const m of members) {
    if (m.parentId && memberMap.has(m.parentId)) {
      edges.push({
        id: `e-${m.parentId}-${m.id}`,
        source: m.parentId,
        target: m.id,
      });
    }
  }

  return { nodes, edges };
}
