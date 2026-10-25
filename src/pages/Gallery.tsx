import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SkillTree } from '../types';
import { loadTrees, saveTrees } from '../storage';
import { seedTrees } from '../data/seeds';
import { Search, Plus, GitFork, BookOpen } from 'lucide-react';

export default function Gallery() {
  const [trees, setTrees] = useState<SkillTree[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let loaded = loadTrees();
    if (loaded.length === 0) {
      loaded = seedTrees;
      saveTrees(loaded);
    }
    setTrees(loaded);
  }, []);

  const filteredTrees = trees.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  // THIS IS THE NEW FUNCTION
  const handleCreateNew = () => {
    const newTree: SkillTree = {
      id: `tree-${Date.now()}`,
      title: 'Untitled Skill Tree',
      description: 'A brand new journey.',
      category: 'Custom',
      createdAt: Date.now(),
      nodes: [],
      edges: [],
    };
    
    const updated = [...trees, newTree];
    setTrees(updated);
    saveTrees(updated);
    navigate(`/tree/${newTree.id}/edit`);
  };

  const handleFork = (e: React.MouseEvent, tree: SkillTree) => {
    e.preventDefault();
    const newTree: SkillTree = {
      ...tree,
      id: `tree-${Date.now()}`,
      title: `${tree.title} (Copy)`,
      createdAt: Date.now(),
      forkedFrom: tree.id,
      nodes: tree.nodes.map(n => ({ ...n, id: `${n.id}-${Date.now()}` })),
      edges: [],
    };
    
    newTree.edges = tree.edges.map(e => {
      const newSource = newTree.nodes.find(n => n.id.startsWith(e.source))?.id || e.source;
      const newTarget = newTree.nodes.find(n => n.id.startsWith(e.target))?.id || e.target;
      return { id: `e-${Date.now()}-${Math.random()}`, source: newSource, target: newTarget };
    });

    const updated = [...trees, newTree];
    setTrees(updated);
    saveTrees(updated);
    navigate(`/tree/${newTree.id}/edit`);
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Skill Trees</h1>
            <p className="text-textMuted">Explore, learn, and track your progress.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
              <input 
                type="text" 
                placeholder="Search trees..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-panel border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent w-64 transition-colors"
              />
            </div>
            {/* THIS BUTTON IS NOW CONNECTED TO handleCreateNew */}
            <button 
              onClick={handleCreateNew}
              className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> New Tree
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrees.map(tree => (
            <Link 
              key={tree.id} 
              to={`/tree/${tree.id}`}
              className="group bg-panel border border-border hover:border-accent rounded-xl p-6 transition-all flex flex-col h-48 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen size={64} />
              </div>
              
              <div className="text-xs font-semibold text-accent tracking-wider uppercase mb-2">{tree.category}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{tree.title}</h3>
              <p className="text-sm text-textMuted line-clamp-2 mb-4 flex-1">{tree.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <span className="text-xs text-textMuted">{tree.nodes.length} skills</span>
                <button 
                  onClick={(e) => handleFork(e, tree)}
                  className="text-textMuted hover:text-accent p-1 rounded hover:bg-border transition-colors"
                  title="Fork this tree"
                >
                  <GitFork size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredTrees.length === 0 && (
          <div className="text-center py-20 text-textMuted">
            No trees found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
}