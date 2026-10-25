import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ReactFlow, Background, Controls, useNodesState, useEdgesState, 
  addEdge, Connection, ReactFlowProvider, useReactFlow 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SkillTree, SkillNode as SkillNodeType } from '../types';
import { loadTrees, saveTrees } from '../storage';
import { wouldCreateCycle } from '../lib/graph';
import SkillNode from '../components/SkillNode';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

function EditorCanvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();
  
  const [tree, setTree] = useState<SkillTree | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const trees = loadTrees();
    const found = trees.find(t => t.id === id);
    if (found) {
      setTree(found);
      setNodes(found.nodes.map(n => ({
        id: n.id,
        position: n.position,
        data: { title: n.title, estTime: n.estTime, state: 'available' },
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
      data: { title: 'New Skill', estTime: '1 week', state: 'available' },
      type: 'skillNode',
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNodeId);
  };

  const deleteNode = (nodeId: string) => {
    if (!confirm('Delete this node and all its connections?')) return;
    
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  };

  const updateNodeData = (field: string, value: string) => {
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

  const saveAndExit = () => {
    if (!tree) return;

    // Make sure we don't save an empty title
    const finalTitle = tree.title.trim() === '' ? 'Untitled Skill Tree' : tree.title;

    const updatedNodes: SkillNodeType[] = nodes.map(n => {
      const existing = tree.nodes.find(tn => tn.id === n.id);
      return {
        id: n.id,
        title: n.data.title,
        estTime: n.data.estTime,
        position: n.position,
        description: existing?.description || '',
        resources: existing?.resources || [],
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
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={{ skillNode: SkillNode }}
          fitView
          className="bg-bg"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#2A2A2A" gap={24} size={2} />
          <Controls />
        </ReactFlow>

        {/* FLOATING HEADER */}
        <div className="absolute top-4 left-4 z-10 flex gap-4">
          <Link to={`/tree/${tree.id}`} className="bg-panel border border-border p-2 rounded-lg hover:border-textMuted transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-panel border border-border px-6 py-2 rounded-lg flex items-center gap-4">
            
            {/* EDITABLE TREE TITLE */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tree.title}
                onChange={(e) => setTree({ ...tree, title: e.target.value })}
                className="bg-transparent border-none outline-none font-bold text-lg focus:ring-0 p-0 w-64 text-textMain placeholder-textMuted"
                placeholder="Tree Name..."
              />
              <span className="text-accent text-sm font-medium">(Editing)</span>
            </div>

            <div className="w-px h-8 bg-border mx-2"></div>
            <button 
              onClick={saveAndExit}
              className="text-success hover:text-success/80 flex items-center gap-2 text-sm font-bold transition-colors"
            >
              <Save size={16} /> Save & View
            </button>
          </div>
        </div>

        <button
          onClick={addNode}
          className="absolute bottom-6 right-6 z-10 bg-accent hover:bg-accentHover text-white p-4 rounded-full shadow-lg transition-colors"
          title="Add new skill node"
        >
          <Plus size={24} />
        </button>
        
        <div className="absolute bottom-6 left-6 z-10 bg-panel/80 backdrop-blur border border-border px-4 py-2 rounded-lg text-xs text-textMuted">
          Drag from the dot on the bottom of a node to the top of another to connect them.
        </div>
      </div>

      {/* EDIT NODE SIDEBAR */}
      {selectedNode && (
        <div className="w-80 border-l border-border bg-panel p-6 flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Node</h2>
            <button 
              onClick={() => deleteNode(selectedNode.id)}
              className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors"
              title="Delete Node"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={selectedNode.data.title}
                onChange={(e) => updateNodeData('title', e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">Estimated Time</label>
              <input 
                type="text" 
                value={selectedNode.data.estTime}
                onChange={(e) => updateNodeData('estTime', e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
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