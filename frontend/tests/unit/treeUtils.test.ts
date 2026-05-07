import { describe, it, expect } from 'vitest';
import { flatToFlowGraph } from '@/lib/treeUtils';
import type { Member } from '@/types';

function makeMember(overrides: Partial<Member> & { id: string; fullName: string }): Member {
  const base: Member = {
    id: overrides.id,
    fullName: overrides.fullName,
    avatar: null,
    birthYear: null,
    birthDate: null,
    deathYear: null,
    deathDate: null,
    gender: null,
    bio: null,
    achievements: [],
    parentId: null,
    chiId: null,
    descendantsCount: null,
    generation: null,
    siblingsCount: null,
    spousesCount: null,
    sonsCount: null,
    daughtersCount: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
  return { ...base, ...overrides };
}

describe('flatToFlowGraph', () => {
  it('returns empty nodes and edges for an empty array', () => {
    const result = flatToFlowGraph([]);
    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('returns 1 node and 0 edges for a single root member', () => {
    const member = makeMember({ id: '1', fullName: 'A', parentId: null });
    const result = flatToFlowGraph([member]);

    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);

    expect(result.nodes[0].id).toBe('1');
    expect(result.nodes[0].data.member).toBe(member);
  });

  it('returns 2 nodes and 1 edge when child.parentId === root.id', () => {
    const root = makeMember({ id: 'root', fullName: 'Root', parentId: null });
    const child = makeMember({ id: 'child', fullName: 'Child', parentId: 'root' });

    const result = flatToFlowGraph([root, child]);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);

    const edge = result.edges[0];
    expect(edge.source).toBe('root');
    expect(edge.target).toBe('child');
  });

  it('assigns correct depth levels: root at y=0, child at y=200', () => {
    const root = makeMember({ id: 'root', fullName: 'Root', parentId: null });
    const child = makeMember({ id: 'child', fullName: 'Child', parentId: 'root' });

    const result = flatToFlowGraph([root, child]);

    const rootNode = result.nodes.find((n) => n.id === 'root')!;
    const childNode = result.nodes.find((n) => n.id === 'child')!;

    expect(rootNode.position.y).toBe(0);
    expect(childNode.position.y).toBe(200);
  });

  it('generates edge id with format e-{parentId}-{childId}', () => {
    const root = makeMember({ id: 'p1', fullName: 'Parent', parentId: null });
    const child = makeMember({ id: 'c1', fullName: 'Child', parentId: 'p1' });

    const result = flatToFlowGraph([root, child]);

    expect(result.edges[0].id).toBe('e-p1-c1');
  });

  it('handles multiple roots (no parentId) as separate trees', () => {
    const root1 = makeMember({ id: 'r1', fullName: 'Root 1', parentId: null });
    const root2 = makeMember({ id: 'r2', fullName: 'Root 2', parentId: null });

    const result = flatToFlowGraph([root1, root2]);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(0);
  });

  it('sets node type to memberNode', () => {
    const member = makeMember({ id: '1', fullName: 'A' });
    const result = flatToFlowGraph([member]);
    expect(result.nodes[0].type).toBe('memberNode');
  });
});
