import { SkillTree } from '../types';

export const seedTrees: SkillTree[] = [
  {
    id: 'tree-web-dev',
    title: 'Web Development',
    description: 'From zero to full-stack web developer.',
    category: 'Development',
    createdAt: Date.now(),
    nodes: [
      { id: 'wd1', title: 'HTML Basics', description: 'Structure of the web.', resources: ['https://developer.mozilla.org/en-US/docs/Web/HTML'], estTime: '1 week', position: { x: 250, y: 50 } },
      { id: 'wd2', title: 'CSS Fundamentals', description: 'Styling and layout.', resources: ['https://developer.mozilla.org/en-US/docs/Web/CSS'], estTime: '2 weeks', position: { x: 250, y: 150 } },
      { id: 'wd3', title: 'JavaScript Core', description: 'Variables, functions, DOM.', resources: ['https://javascript.info/'], estTime: '4 weeks', position: { x: 250, y: 250 } },
      { id: 'wd4', title: 'React', description: 'Component-based UI.', resources: ['https://react.dev/'], estTime: '3 weeks', position: { x: 100, y: 350 } },
      { id: 'wd5', title: 'Node.js & Express', description: 'Backend APIs.', resources: ['https://nodejs.org/'], estTime: '3 weeks', position: { x: 400, y: 350 } },
    ],
    edges: [
      { id: 'e1', source: 'wd1', target: 'wd2' },
      { id: 'e2', source: 'wd2', target: 'wd3' },
      { id: 'e3', source: 'wd3', target: 'wd4' },
      { id: 'e4', source: 'wd3', target: 'wd5' },
    ],
  },
  {
    id: 'tree-python',
    title: 'Python Programming',
    description: 'Master Python for scripting and automation.',
    category: 'Data',
    createdAt: Date.now() - 1000,
    nodes: [
      { id: 'py1', title: 'Syntax & Variables', description: 'Basic Python structures.', resources: [], estTime: '1 week', position: { x: 250, y: 50 } },
      { id: 'py2', title: 'Data Structures', description: 'Lists, dicts, sets.', resources: [], estTime: '2 weeks', position: { x: 250, y: 150 } },
      { id: 'py3', title: 'OOP', description: 'Classes and Objects.', resources: [], estTime: '2 weeks', position: { x: 250, y: 250 } },
      { id: 'py4', title: 'Pandas', description: 'Data manipulation.', resources: [], estTime: '2 weeks', position: { x: 100, y: 350 } },
      { id: 'py5', title: 'Flask/FastAPI', description: 'Web APIs in Python.', resources: [], estTime: '2 weeks', position: { x: 400, y: 350 } },
    ],
    edges: [
      { id: 'e1', source: 'py1', target: 'py2' },
      { id: 'e2', source: 'py2', target: 'py3' },
      { id: 'e3', source: 'py2', target: 'py4' },
      { id: 'e4', source: 'py3', target: 'py5' },
    ],
  },
  {
    id: 'tree-data',
    title: 'Data Analysis',
    description: 'Learn to extract insights from data.',
    category: 'Data',
    createdAt: Date.now() - 2000,
    nodes: [
      { id: 'da1', title: 'Excel / Sheets', description: 'Basic data entry and formulas.', resources: [], estTime: '1 week', position: { x: 250, y: 50 } },
      { id: 'da2', title: 'SQL Basics', description: 'Querying relational databases.', resources: [], estTime: '2 weeks', position: { x: 250, y: 150 } },
      { id: 'da3', title: 'Statistics', description: 'Mean, median, distributions.', resources: [], estTime: '3 weeks', position: { x: 250, y: 250 } },
      { id: 'da4', title: 'Data Visualization', description: 'Tableau or PowerBI.', resources: [], estTime: '2 weeks', position: { x: 250, y: 350 } },
    ],
    edges: [
      { id: 'e1', source: 'da1', target: 'da2' },
      { id: 'e2', source: 'da2', target: 'da3' },
      { id: 'e3', source: 'da3', target: 'da4' },
    ],
  }
];