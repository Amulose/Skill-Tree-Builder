import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ReactFlow, Background, Controls, useNodesState, useEdgesState, 
  addEdge, Connection, ReactFlowProvider, useReactFlow 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SkillTree, SkillNode as SkillNodeType } from '../types';
import { loadTrees, saveTrees } from '../storage';
import { wouldCreateCycle, getAutoLayout } from '../lib/graph';
import SkillNode from '../components/SkillNode';
import { ArrowLeft, Save, Plus, Trash2, Wand2, Settings, X, Link as LinkIcon } from 'lucide-react';

function EditorCanvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const [tree, setTree] = useState<SkillTree | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // State for adding a new resource
  const [newResource, setNewResource] = useState('');

  useEffect(() => {
    const trees = loadTrees();
    const found = trees.find(t => t.id === id);
    if (found) {
      setTree(found);
      setNodes(found.nodes.map(n => ({
        id: n.id,
        position: n.position,
        data: { 
          title: n.title, 
          estTime: n.estTime, 
          state: 'available',
          resources: n.resources || [] // Load resources into node data
        },
        type: 'skillNode',
      })) as any);
      setEdges(found.edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    }
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    
    if (wouldCreateCycle(params.source, params.target, edges)) {
      alert("Cannot connect: This would create a circular dependency!");
      return;
    }

    setEdges((eds) => addEdge({ ...params, animated: true } as any, eds));
  }, [edges, setEdges]);

  const addNode = () => {
    const newNodeId = `node-${Date.now()}`;
    
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode = {
      id: newNodeId,
      position,
      data: { title: 'New Skill', estTime: '1 week', state: 'available', resources: [] },
      type: 'skillNode',
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNodeId);
  };

  const handleTidyUp = () => {
    const layoutedNodes = getAutoLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => fitView({ duration: 800 }), 50); 
  };

  const deleteNode = (nodeId: string) => {
    if (!confirm('Delete this node and all its connections?')) return;
    
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  };

  const updateNodeData = (field: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: { ...node.data, [field]: value },
          };
        }
        return node;
      })
    );
  };

  const addResource = () => {
    if (!newResource.trim()) return;
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const currentResources = selectedNode?.data.resources || [];
    updateNodeData('resources', [...currentResources, newResource.trim()]);
    setNewResource('');
  };

  const removeResource = (index: number) => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const currentResources = selectedNode?.data.resources || [];
    const updated = currentResources.filter((_: any, i: number) => i !== index);
    updateNodeData('resources', updated);
  };

  const saveAndExit = () => {
    if (!tree) return;

    const finalTitle = tree.title.trim() === '' ? 'Untitled Skill Tree' : tree.title;

    const updatedNodes: SkillNodeType[] = nodes.map(n => {
      return {
        id: n.id,
        title: n.data.title,
        estTime: n.data.estTime,
        position: n.position,
        description: '', // We can add description editing later
        resources: n.data.resources || [], // Save the resources!
      };
    });

    const updatedEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    const updatedTree: SkillTree = {
      ...tree,
      title: finalTitle,
      nodes: updatedNodes,
      edges: updatedEdges,
    };

    const allTrees = loadTrees();
    const newTreesList = allTrees.map(t => t.id === tree.id ? updatedTree : t);
    saveTrees(newTreesList);
    
    navigate(`/tree/${tree.id}`);
  };

  if (!tree) return <div className="p-8">Tree not found.</div>;

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => { setSelectedNodeId(node.id); setNewResource(''); }}
          onPaneClick={() => { setSelectedNodeId(null); setShowSettings(false); }}
          nodeTypes={{ skillNode: SkillNode }}
          fitView
          className="bg-bg"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#27272A" gap={32} size={1.5} />
          <Controls />
        </ReactFlow>

        {/* FLOATING HEADER */}
        <div className="absolute top-4 left-4 right-4 md:right-auto z-10 flex flex-wrap gap-3 animate-fade-in">
          <Link to={`/tree/${tree.id}`} className="bg-panel/80 backdrop-blur-md border border-border p-2.5 h-fit rounded-xl hover:border-textMuted hover:bg-panel transition-all shadow-lg active:scale-95">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="bg-panel/80 backdrop-blur-md border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <input
              type="text"
              value={tree.title}
              onChange={(e) => setTree({ ...tree, title: e.target.value })}
              className="bg-transparent border-none outline-none font-bold text-lg focus:ring-0 p-0 w-32 md:w-64 text-textMain placeholder-textMuted"
              placeholder="Tree Name..."
            />
            <span className="text-accent text-xs font-bold tracking-wider uppercase hidden md:block bg-accent/10 px-2 py-1 rounded">Editing</span>
            
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-lg transition-all active:scale-95 ${showSettings ? 'text-accent bg-accent/20' : 'text-textMuted hover:text-textMain hover:bg-border/50'}`}
              title="Tree Settings"
            >
              <Settings size={18} />
            </button>
            <div className="w-px h-6 bg-border"></div>
            <button 
              onClick={saveAndExit}
              className="text-success hover:text-white bg-success/10 hover:bg-success px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all active:scale-95"
            >
              <Save size={16} /> <span className="hidden md:inline">Save</span>
            </button>
          </div>
        </div>

        {/* FLOATING BOTTOM BUTTONS */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-4 animate-fade-in">
          <button
            onClick={handleTidyUp}
            className="bg-panel/80 backdrop-blur-md border border-border hover:border-accent text-textMain p-4 rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 active:scale-95 hover:scale-105"
            title="Auto-arrange nodes"
          >
            <Wand2 size={24} className="text-accent" />
          </button>
          <button
            onClick={addNode}
            className="bg-accent hover:bg-accentHover text-white p-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300 active:scale-95 hover:scale-105"
            title="Add new skill node"
          >
            <Plus size={24} />
          </button>
        </div>
        
        {!selectedNode && !showSettings && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-panel/80 backdrop-blur-md border border-border px-4 py-2 rounded-full text-xs font-medium text-textMuted hidden md:block transition-all animate-fade-in shadow-lg">
            Drag from the bottom dot of a node to the top of another to connect them
          </div>
        )}
      </div>

      {/* TREE SETTINGS SIDEBAR */}
      {showSettings && (
        <div className="w-full md:w-80 border-l border-border bg-panel/95 backdrop-blur-xl p-6 flex flex-col absolute bottom-0 left-0 right-0 h-[50vh] md:top-0 md:h-full z-20 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight">Tree Settings</h2>
            <button onClick={() => setShowSettings(false)} className="text-textMuted hover:text-textMain p-1 bg-border/50 hover:bg-border rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">Category</label>
              <input 
                type="text" 
                value={tree.category}
                onChange={(e) => setTree({ ...tree, category: e.target.value })}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">Description</label>
              <textarea 
                rows={4}
                value={tree.description}
                onChange={(e) => setTree({ ...tree, description: e.target.value })}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT NODE SIDEBAR */}
      {selectedNode && !showSettings && (
        <div className="w-full md:w-80 border-l border-border bg-panel/95 backdrop-blur-xl p-6 flex flex-col absolute bottom-0 left-0 right-0 h-[50vh] md:top-0 md:h-full z-20 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight">Edit Node</h2>
            <button 
              onClick={() => deleteNode(selectedNode.id)}
              className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors"
              title="Delete Node"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={selectedNode.data.title}
                onChange={(e) => updateNodeData('title', e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">Estimated Time</label>
              <input 
                type="text" 
                value={selectedNode.data.estTime}
                onChange={(e) => updateNodeData('estTime', e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            {/* RESOURCES SECTION */}
            <div className="pt-4 border-t border-border/50">
              <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon size={12} /> Resources
              </label>
              
              <div className="flex gap-2 mb-3">
                <input 
                  type="url" 
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addResource()}
                  placeholder="https://..."
                  className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
                <button 
                  onClick={addResource}
                  className="bg-accent/20 text-accent hover:bg-accent hover:text-white px-3 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>

              <ul className="space-y-2">
                {(selectedNode.data.resources || []).map((url: string, i: number) => (
                  <li key={i} className="flex items-center justify-between bg-bg border border-border/50 rounded-lg p-2 group">
                    <span className="text-xs text-textMuted truncate flex-1 mr-2" title={url}>{url}</span>
                    <button 
                      onClick={() => removeResource(i)}
                      className="text-textMuted hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
                {(!selectedNode.data.resources || selectedNode.data.resources.length === 0) && (
                  <li className="text-xs text-textMuted italic text-center py-2">No resources added yet</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  );
}