export type NodeState = 'completed' | 'available' | 'locked';

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  resources: string[];
  estTime: string;
  position: { x: number; y: number };
}

export interface SkillEdge {
  id: string;
  source: string; // prerequisite
  target: string; // dependent
}

export interface SkillTree {
  id: string;
  title: string;
  description: string;
  category: string;
  nodes: SkillNode[];
  edges: SkillEdge[];
  createdAt: number;
  forkedFrom?: string;
}

// Tracks which nodes are completed: { [treeId]: ['nodeId1', 'nodeId2'] }
export interface ProgressStore {
  [treeId: string]: string[];
}