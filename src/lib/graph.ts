import { SkillTree, NodeState } from '../types';
import dagre from '@dagrejs/dagre';

// Checks if adding an edge (source -> target) would create a cycle
export function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: any[]
): boolean {
  if (sourceId === targetId) return true;

  const adj: Record<string, string[]> = {};
  edges.forEach((e) => {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  });

  const visited = new Set<string>();
  const stack = [targetId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === sourceId) return true;

    if (!visited.has(current)) {
      visited.add(current);
      if (adj[current]) stack.push(...adj[current]);
    }
  }

  return false;
}

// Determines the state of every node in the tree
export function getNodeStates(tree: SkillTree, completedNodeIds: string[]): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};
  const completedSet = new Set(completedNodeIds);

  const prereqs: Record<string, string[]> = {};
  tree.edges.forEach((e) => {
    if (!prereqs[e.target]) prereqs[e.target] = [];
    prereqs[e.target].push(e.source);
  });

  tree.nodes.forEach((node) => {
    if (completedSet.has(node.id)) {
      states[node.id] = 'completed';
      return;
    }

    const nodePrereqs = prereqs[node.id] || [];
    const allPrereqsMet = nodePrereqs.every((prereqId) => completedSet.has(prereqId));

    states[node.id] = allPrereqsMet ? 'available' : 'locked';
  });

  return states;
}

// Auto-layout function for the Tidy Up button
export function getAutoLayout(nodes: any[], edges: any[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 192, height: 80 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - 96, 
        y: pos.y - 40, 
      },
    };
  });
}

export function calculateLayout(tree: SkillTree): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  tree.nodes.forEach(n => positions[n.id] = n.position);
  return positions;
}