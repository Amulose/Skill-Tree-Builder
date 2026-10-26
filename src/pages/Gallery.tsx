import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SkillTree } from '../types';
import { loadTrees, saveTrees } from '../storage';
import { seedTrees } from '../data/seeds';
import { Search, Plus, GitFork, BookOpen, Trash2, RotateCcw } from 'lucide-react';

export default function Gallery() {
  const [trees, setTrees] = useState<SkillTree[]>([]);
  const [deletedTrees, setDeletedTrees] = useState<SkillTree[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let loaded = loadTrees();
    if (loaded.length === 0 && !localStorage.getItem('stb:deleted')) {
      loaded = seedTrees;
      saveTrees(loaded);
    }
    setTrees(loaded);

    const deletedData = localStorage.getItem('stb:deleted');
    if (deletedData) setDeletedTrees(JSON.parse(deletedData));
  }, []);

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

  const handleDelete = (e: React.MouseEvent, tree: SkillTree) => {
    e.preventDefault();
    if (!confirm(`Move "${tree.title}" to trash?`)) return;

    const updatedTrees = trees.filter(t => t.id !== tree.id);
    const updatedDeleted = [...deletedTrees, tree];
    
    setTrees(updatedTrees);
    setDeletedTrees(updatedDeleted);
    saveTrees(updatedTrees);
    localStorage.setItem('stb:deleted', JSON.stringify(updatedDeleted));
  };

  const handleRestore = (e: React.MouseEvent, tree: SkillTree) => {
    e.preventDefault();
    const updatedTrees = [...trees, tree];
    const updatedDeleted = deletedTrees.filter(t => t.id !== tree.id);
    
    setTrees(updatedTrees);
    setDeletedTrees(updatedDeleted);
    saveTrees(updatedTrees);
    localStorage.setItem('stb:deleted', JSON.stringify(updatedDeleted));
  };

  const handlePermanentDelete = (e: React.MouseEvent, tree: SkillTree) => {
    e.preventDefault();
    if (!confirm(`Permanently delete "${tree.title}"? This cannot be undone.`)) return;

    const updatedDeleted = deletedTrees.filter(t => t.id !== tree.id);
    setDeletedTrees(updatedDeleted);
    localStorage.setItem('stb:deleted', JSON.stringify(updatedDeleted));
  };

  const activeList = showTrash ? deletedTrees : trees;

  const filteredTrees = activeList.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto p-8 relative z-10">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              {showTrash ? 'Trash' : 'Your Skill Trees'}
            </h1>
            <p className="text-textMuted">
              {showTrash ? 'Restore or permanently delete trees.' : 'Explore, learn, and track your progress.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search trees..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-panel/80 backdrop-blur-md border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent w-64 transition-all shadow-sm"
              />
            </div>
            
            <button 
              onClick={() => setShowTrash(!showTrash)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all active:scale-95 ${
                showTrash ? 'bg-border text-textMain shadow-inner' : 'text-textMuted hover:text-textMain hover:bg-panel'
              }`}
            >
              <Trash2 size={16} /> {showTrash ? 'Back' : 'Trash'}
            </button>

            {!showTrash && (
              <button 
                onClick={handleCreateNew}
                className="bg-accent hover:bg-accentHover text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] active:scale-95"
              >
                <Plus size={18} /> New Tree
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrees.map((tree, i) => (
            <Link 
              key={tree.id} 
              to={showTrash ? '#' : `/tree/${tree.id}`}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`group bg-panel/80 backdrop-blur-sm border border-border/80 rounded-2xl p-6 transition-all duration-300 flex flex-col h-52 relative overflow-hidden animate-slide-up hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-accent/50 ${showTrash ? 'opacity-70 grayscale-[30%]' : ''}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <BookOpen size={80} />
              </div>
              
              <div className="text-[10px] font-bold text-accent tracking-widest uppercase mb-3 px-2 py-1 bg-accent/10 rounded-md w-fit border border-accent/20">{tree.category}</div>
              <h3 className={`text-2xl font-bold mb-2 tracking-tight ${!showTrash && 'group-hover:text-accent'} transition-colors truncate`}>{tree.title}</h3>
              <p className="text-sm text-textMuted line-clamp-2 mb-4 flex-1 leading-relaxed">{tree.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <span className="text-xs font-medium text-textMuted bg-bg/50 px-2 py-1 rounded-md">{tree.nodes.length} skills</span>
                
                <div className="flex gap-1">
                  {showTrash ? (
                    <>
                      <button onClick={(e) => handleRestore(e, tree)} className="text-textMuted hover:text-success p-2 rounded-lg hover:bg-success/10 transition-colors" title="Restore">
                        <RotateCcw size={16} />
                      </button>
                      <button onClick={(e) => handlePermanentDelete(e, tree)} className="text-textMuted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Permanently">
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => handleFork(e, tree)} className="text-textMuted hover:text-accent p-2 rounded-lg hover:bg-accent/10 transition-colors" title="Fork">
                        <GitFork size={16} />
                      </button>
                      <button onClick={(e) => handleDelete(e, tree)} className="text-textMuted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Move to Trash">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredTrees.length === 0 && (
          <div className="text-center py-32 text-textMuted animate-fade-in">
            <div className="bg-panel inline-flex p-6 rounded-full mb-4">
              <BookOpen size={48} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-textMain mb-2">{showTrash ? 'Trash is empty' : 'No trees found'}</h3>
            <p>{showTrash ? 'Deleted trees will appear here.' : `We couldn't find anything matching "${search}".`}</p>
          </div>
        )}
      </div>
    </div>
  );
}