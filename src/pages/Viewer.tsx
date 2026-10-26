import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, getNodesBounds, getViewportForBounds, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { SkillTree, ProgressStore, NodeState } from '../types';
import { loadTrees, loadProgress, saveProgress } from '../storage';
import { getNodeStates } from '../lib/graph';
import SkillNode from '../components/SkillNode';
import { ArrowLeft, Edit3, CheckCircle2, Download, X } from 'lucide-react';

function ViewerCanvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState<SkillTree | null>(null);
  const [progress, setProgress] = useState<ProgressStore>({});
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const trees = loadTrees();
    const found = trees.find(t => t.id === id);
    if (found) {
      setTree(found);
      setProgress(loadProgress());
    }
  }, [id]);

  useEffect(() => {
    if (!tree) return;
    
    const completedIds = progress[tree.id] || [];
    const states = getNodeStates(tree, completedIds);

    const rfNodes = tree.nodes.map(n => ({
      id: n.id,
      position: n.position,
      data: { 
        title: n.title, 
        estTime: n.estTime, 
        state: states[n.id] as NodeState,
      },
      type: 'skillNode',
    }));

    const rfEdges = tree.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
    }));

    setNodes(rfNodes as any);
    setEdges(rfEdges as any);
  }, [tree, progress, setNodes, setEdges]);

  const toggleComplete = (nodeId: string) => {
    if (!tree) return;
    const currentCompleted = progress[tree.id] || [];
    const isCompleted = currentCompleted.includes(nodeId);
    
    const states = getNodeStates(tree, currentCompleted);
    if (!isCompleted && states[nodeId] === 'locked') return; 

    const newCompleted = isCompleted 
      ? currentCompleted.filter(id => id !== nodeId)
      : [...currentCompleted, nodeId];

    const newProgress = { ...progress, [tree.id]: newCompleted };
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const downloadImage = useCallback(() => {
    if (nodes.length === 0) return;
    
    const nodesBounds = getNodesBounds(nodes);
    const transform = getViewportForBounds(nodesBounds, 1024, 768, 0.5, 2, 0.1);
    
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#09090B',
        width: 1024,
        height: 768,
        style: {
          width: '1024px',
          height: '768px',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
      }).then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', `${tree?.title || 'skill-tree'}.png`);
        a.setAttribute('href', dataUrl);
        a.click();
      });
    }
  }, [nodes, tree]);

  if (!tree) return <div className="p-8">Tree not found.</div>;

  const selectedNodeData = tree.nodes.find(n => n.id === selectedNodeId);
  const completedCount = (progress[tree.id] || []).length;
  const totalNodes = tree.nodes.length;

  return (
    <div className="flex h-full w-full relative">
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={{ skillNode: SkillNode }}
          fitView
          className="bg-bg"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#27272A" gap={32} size={1.5} />
          <Controls className="hidden md:flex" />
          <MiniMap nodeColor="#3F3F46" maskColor="rgba(9,9,11,0.7)" className="hidden md:block" />
        </ReactFlow>

        <div className="absolute top-4 left-4 right-4 md:right-auto z-10 flex flex-wrap gap-3 animate-fade-in">
          <Link to="/" className="bg-panel/80 backdrop-blur-md border border-border p-2.5 h-fit rounded-xl hover:border-textMuted hover:bg-panel transition-all shadow-lg active:scale-95">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="bg-panel/80 backdrop-blur-md border border-border px-5 py-2.5 rounded-xl flex items-center gap-4 flex-1 md:flex-none shadow-lg">
            <div className="flex-1 md:flex-none">
              <h2 className="font-bold text-base md:text-lg tracking-tight truncate">{tree.title}</h2>
              <div className="text-[10px] md:text-xs font-medium text-textMuted flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={12} className="text-success" />
                {completedCount} / {totalNodes} Completed
              </div>
            </div>
            <div className="w-px h-8 bg-border mx-1"></div>
            <button 
              onClick={downloadImage}
              className="text-textMuted hover:text-accent flex items-center gap-2 text-sm font-medium transition-all active:scale-95 p-2 rounded-lg hover:bg-accent/10"
              title="Export as Image"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => navigate(`/tree/${tree.id}/edit`)}
              className="text-textMuted hover:text-accent flex items-center gap-2 text-sm font-medium transition-all active:scale-95 p-2 rounded-lg hover:bg-accent/10"
            >
              <Edit3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {selectedNodeData && (
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] border-t md:border-t-0 md:border-l border-border bg-panel/95 backdrop-blur-xl p-6 flex flex-col z-20 shadow-2xl md:w-80 md:h-full md:right-0 md:top-0 md:bottom-0 animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold tracking-tight">{selectedNodeData.title}</h2>
            <button onClick={() => setSelectedNodeId(null)} className="md:hidden text-textMuted hover:text-textMain p-1 bg-border/50 rounded-lg">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <p className="text-sm text-textMuted mb-6 leading-relaxed">
              {selectedNodeData.description || "No description provided."}
            </p>
            
            <div className="mb-6 bg-bg/50 p-4 rounded-xl border border-border/50">
              <h3 className="text-xs font-bold mb-1 text-textMuted uppercase tracking-wider">Estimated Time</h3>
              <p className="text-sm font-medium">{selectedNodeData.estTime}</p>
            </div>

            {selectedNodeData.resources?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold mb-3 text-textMuted uppercase tracking-wider">Resources</h3>
                <ul className="space-y-2">
                  {selectedNodeData.resources.map((url, i) => (
                    <li key={i}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-accent hover:text-white bg-accent/10 hover:bg-accent px-3 py-2 rounded-lg text-sm truncate block transition-colors">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-auto">
            <button
              onClick={() => toggleComplete(selectedNodeData.id)}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 ${
                (progress[tree.id] || []).includes(selectedNodeData.id)
                  ? 'bg-success/10 text-success border border-success/30 hover:bg-success/20'
                  : 'bg-accent text-white hover:bg-accentHover shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)]'
              }`}
            >
              {(progress[tree.id] || []).includes(selectedNodeData.id) 
                ? 'Mark as Incomplete' 
                : 'Mark as Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Viewer() {
  return (
    <ReactFlowProvider>
      <ViewerCanvas />
    </ReactFlowProvider>
  );
}