import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SkillTree, ProgressStore, NodeState } from '../types';
import { loadTrees, loadProgress, saveProgress } from '../storage';
import { getNodeStates } from '../lib/graph';
import SkillNode from '../components/SkillNode';
import { ArrowLeft, Edit3, CheckCircle2 } from 'lucide-react';

export default function Viewer() {
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

  if (!tree) return <div className="p-8">Tree not found.</div>;

  const selectedNodeData = tree.nodes.find(n => n.id === selectedNodeId);
  const completedCount = (progress[tree.id] || []).length;
  const totalNodes = tree.nodes.length;

  return (
    <div className="flex h-full w-full">
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
          <Background color="#2A2A2A" gap={24} size={2} />
          <Controls />
          <MiniMap nodeColor="#3F3F46" maskColor="rgba(10,10,10,0.7)" />
        </ReactFlow>

        <div className="absolute top-4 left-4 z-10 flex gap-4">
          <Link to="/" className="bg-panel border border-border p-2 rounded-lg hover:border-textMuted transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-panel border border-border px-6 py-2 rounded-lg flex items-center gap-4">
            <div>
              <h2 className="font-bold">{tree.title}</h2>
              <div className="text-xs text-textMuted flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} className="text-success" />
                {completedCount} / {totalNodes} Completed
              </div>
            </div>
            <div className="w-px h-8 bg-border mx-2"></div>
            <button 
              onClick={() => navigate(`/tree/${tree.id}/edit`)}
              className="text-textMuted hover:text-accent flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>
        </div>
      </div>

      {selectedNodeData && (
        <div className="w-80 border-l border-border bg-panel p-6 flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-2xl">
          <h2 className="text-xl font-bold mb-2">{selectedNodeData.title}</h2>
          <p className="text-sm text-textMuted mb-6 leading-relaxed">
            {selectedNodeData.description || "No description provided."}
          </p>
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 text-textMain">Estimated Time</h3>
            <p className="text-sm text-textMuted">{selectedNodeData.estTime}</p>
          </div>

          {selectedNodeData.resources?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-textMain">Resources</h3>
              <ul className="space-y-2">
                {selectedNodeData.resources.map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm truncate block">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-border">
            <button
              onClick={() => toggleComplete(selectedNodeData.id)}
              className={`w-full py-3 rounded-lg font-bold transition-all ${
                (progress[tree.id] || []).includes(selectedNodeData.id)
                  ? 'bg-success/20 text-success border border-success hover:bg-success/30'
                  : 'bg-accent text-white hover:bg-accentHover'
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