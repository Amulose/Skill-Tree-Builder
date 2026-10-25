import { SkillTree, ProgressStore } from './types';

const TREES_KEY = 'stb:trees';
const PROGRESS_KEY = 'stb:progress';

export function loadTrees(): SkillTree[] {
  const data = localStorage.getItem(TREES_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

export function saveTrees(trees: SkillTree[]) {
  localStorage.setItem(TREES_KEY, JSON.stringify(trees));
}

export function loadProgress(): ProgressStore {
  const data = localStorage.getItem(PROGRESS_KEY);
  if (!data) return {};
  try { return JSON.parse(data); } catch { return {}; }
}

export function saveProgress(progress: ProgressStore) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}