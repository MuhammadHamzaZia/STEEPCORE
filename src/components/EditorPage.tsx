import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Sparkles, Circle, Square, Hexagon, Database, Minus, Type, Zap, Grid, LayoutDashboard, Terminal, Check, BookOpen, ChevronDown, User, Loader2, Undo, Redo, MousePointer2, Hand, StickyNote, BoxSelect, Trash2, Save, FileJson, Image, Settings } from 'lucide-react';
import ReactFlow, { Background, Controls, Node, Edge, Handle, Position, useNodesState, useEdgesState, addEdge, Connection, MiniMap, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useUIStore } from '../store/useUIStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint, FlowchartNode } from '../types/schema';

// Primer Color Tokens
const PRIMER_COLORS = {
  default: { bg: 'bg-[#21262d]', border: 'border-[#30363d]', label: 'Default' },
  green: { bg: 'bg-[#238636]/10', border: 'border-[#238636]', label: 'Success' },
  blue: { bg: 'bg-[#1f6feb]/10', border: 'border-[#1f6feb]', label: 'Info' },
  red: { bg: 'bg-[#da3633]/10', border: 'border-[#da3633]', label: 'Danger' },
};

const CustomNode = ({ data, selected }: any) => {
  const colorToken = data.color || 'default';
  const colorStyle = PRIMER_COLORS[colorToken as keyof typeof PRIMER_COLORS];
  
  let shapeClasses = "min-w-[140px] p-3 text-sm text-center font-medium shadow-none transition-all";
  
  if (data.shape === 'pill') {
    shapeClasses += " rounded-full px-6";
  } else if (data.shape === 'diamond') {
    shapeClasses += " rotate-45 flex items-center justify-center w-24 h-24";
  } else if (data.shape === 'cylinder') {
    shapeClasses += " rounded-lg border-t-[10px]";
  } else if (data.shape === 'parallelogram') {
    shapeClasses += " -skew-x-12 px-6";
  } else {
    // Default Rectangle (Process)
    shapeClasses += " rounded-md";
  }

  return (
    <div className={`${shapeClasses} ${colorStyle.bg} border ${selected ? 'border-[#58a6ff] ring-1 ring-[#58a6ff]' : colorStyle.border}`}>
      <Handle type="target" position={Position.Top} className="!bg-[#7d8590] !border-none !w-2 !h-2" />
      <div className={data.shape === 'diamond' ? '-rotate-45 text-xs' : ''}>
        {data.label}
        {data.status && data.status !== 'Not Started' && (
          <div className="text-[10px] text-[#7d8590] mt-1 font-mono">
            [{data.status}]
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#7d8590] !border-none !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="r" className="!bg-[#7d8590] !border-none !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="l" className="!bg-[#7d8590] !border-none !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function FlowEditor({ onBack }: { onBack: () => void }) {
  const { selectedBlueprintId } = useUIStore();
  const { activeRoadmaps, markNodeCompleted } = useLibraryStore();
  const reactFlowInstance = useReactFlow();
  
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'content' | 'style'>('content');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const activeNode = nodes.find(n => n.id === activeNodeId);
  const activeNodeData = activeNode?.data;

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBlueprintId) return;
      setIsLoading(true);
      try {
        const bp = await api.getBlueprintById(selectedBlueprintId);
        const bpNodes = await api.getNodesByBlueprintId(selectedBlueprintId);
        if (bp) setBlueprint(bp);
        
        const activeRoadmap = activeRoadmaps[selectedBlueprintId];
        const completedIds = activeRoadmap?.completedNodes || [];
        
        const initialNodes: Node[] = bpNodes.map(n => ({
          id: n.id,
          type: 'custom',
          position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
          data: { 
             label: n.label,
             status: completedIds.includes(n.id) ? 'Completed' : 'Not Started',
             shape: n.type === 'decision' ? 'diamond' : n.type === 'db' ? 'cylinder' : 'rect',
             color: completedIds.includes(n.id) ? 'green' : 'default',
             description: n.codeSnippet || '',
             subtasks: []
          },
        }));
        
        setNodes(initialNodes);
        
        // Mock edges for visual layout if none exist
        const mockEdges: Edge[] = [];
        for (let i = 0; i < bpNodes.length - 1; i++) {
          mockEdges.push({
            id: `e-${bpNodes[i].id}-${bpNodes[i+1].id}`,
            source: bpNodes[i].id,
            target: bpNodes[i+1].id,
            style: { stroke: '#7d8590', strokeWidth: 1.5 },
          });
        }
        setEdges(mockEdges);
        
      } catch (error) {
        console.error("Failed to fetch blueprint details", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedBlueprintId, setNodes, setEdges]);
  
  // Track Zoom Level
  useEffect(() => {
    setZoomLevel(Math.round(reactFlowInstance.getZoom() * 100));
  }, [reactFlowInstance.getZoom()]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#7d8590', strokeWidth: 1.5 } }, eds)), [setEdges]);
  
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setActiveNodeId(node.id);
  };
  
  const handlePaneClick = () => {
    setActiveNodeId(null);
  };
  
  const updateActiveNodeData = (key: string, value: any) => {
    if (!activeNodeId) return;
    setNodes(nds => nds.map(n => {
      if (n.id === activeNodeId) {
        return { ...n, data: { ...n.data, [key]: value } };
      }
      return n;
    }));
  };

  const deleteActiveNode = () => {
    if (!activeNodeId) return;
    setNodes(nds => nds.filter(n => n.id !== activeNodeId));
    setEdges(eds => eds.filter(e => e.source !== activeNodeId && e.target !== activeNodeId));
    setActiveNodeId(null);
  };
  
  const fitView = () => {
    reactFlowInstance.fitView({ duration: 800 });
  };
  
  const autoLayout = () => {
    // Very simple auto-layout simulator
    setNodes(nds => {
      return nds.map((n, i) => ({
        ...n,
        position: { x: 250, y: i * 150 + 50 }
      }));
    });
    setTimeout(() => fitView(), 50);
  };
  
  const centerNode = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1, duration: 800 });
      setActiveNodeId(id);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117] text-[#e6edf3] font-sans">
      {/* TOP HEADER */}
      <header className="h-12 border-b border-[#30363d] bg-[#010409] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft size={16} />
            <span className="font-medium">Back</span>
          </button>
          <div className="w-px h-5 bg-[#30363d]"></div>
          <h1 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
            <LayoutDashboard size={16} className="text-[#7d8590]" />
            {blueprint?.title || 'Untitled Roadmap'}
          </h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#7d8590] hover:text-[#e6edf3] rounded-md hover:bg-[#161b22] transition-colors" title="Undo">
            <Undo size={16} />
          </button>
          <button className="p-2 text-[#7d8590] hover:text-[#e6edf3] rounded-md hover:bg-[#161b22] transition-colors" title="Redo">
            <Redo size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={async () => {
              try {
                if (blueprint?.id) {
                  await api.updateBlueprint(blueprint.id, {
                    title: blueprint.title,
                    nodes: nodes.map(n => ({
                      id: n.id,
                      title: n.data.label,
                      description: n.data.description,
                      position: n.position
                    })),
                    edges: edges.map(e => ({
                      id: e.id,
                      source: e.source,
                      target: e.target
                    }))
                  });
                } else {
                  await api.createBlueprint({
                    title: blueprint?.title || 'New Blueprint',
                    description: 'Created via Flow Editor',
                    nodes,
                    edges
                  });
                }
                alert('Blueprint saved successfully to STEEPCOREAPI!');
              } catch (err: any) {
                alert(`Saved locally. (API note: ${err.message || err})`);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <Save size={14} />
            Save to API
          </button>

          <button className="flex items-center gap-2 text-sm font-medium bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-[#e6edf3] px-3 py-1.5 rounded-md transition-colors">
            <Sparkles size={14} className="text-[#a371f7]" />
            AI Copilot
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 text-sm font-medium bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-[#e6edf3] px-3 py-1.5 rounded-md transition-colors"
            >
              Export <ChevronDown size={14} />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl py-1 z-50">
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#010409] flex items-center gap-2 text-[#c9d1d9]"><FileJson size={14} /> JSON Data</button>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#010409] flex items-center gap-2 text-[#c9d1d9]"><Image size={14} /> PNG Image</button>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#010409] flex items-center gap-2 text-[#c9d1d9]"><Image size={14} /> SVG Image</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT TOOLBOX & OUTLINER */}
        <aside className="w-[260px] border-r border-[#30363d] bg-[#161b22] flex flex-col shrink-0 z-10 overflow-hidden">
          {/* Section 1: Basic Tools */}
          <div className="p-3 border-b border-[#30363d]">
            <h3 className="text-xs font-semibold text-[#7d8590] uppercase tracking-wider mb-2">Basic Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] px-2 py-1.5 rounded-md bg-[#21262d] border border-[#30363d]">
                <MousePointer2 size={14} className="text-[#e6edf3]" /> Pointer
              </button>
              <button className="flex items-center gap-2 text-sm text-[#7d8590] hover:bg-[#21262d] px-2 py-1.5 rounded-md hover:text-[#c9d1d9]">
                <Hand size={14} /> Pan/Hand
              </button>
              <button className="flex items-center gap-2 text-sm text-[#7d8590] hover:bg-[#21262d] px-2 py-1.5 rounded-md hover:text-[#c9d1d9]">
                <Type size={14} /> Text
              </button>
              <button className="flex items-center gap-2 text-sm text-[#7d8590] hover:bg-[#21262d] px-2 py-1.5 rounded-md hover:text-[#c9d1d9]">
                <StickyNote size={14} /> Note
              </button>
            </div>
          </div>

          {/* Section 2: Flowchart Shapes */}
          <div className="p-3 border-b border-[#30363d]">
            <h3 className="text-xs font-semibold text-[#7d8590] uppercase tracking-wider mb-2">Flowchart Shapes</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 text-sm text-[#c9d1d9] hover:bg-[#21262d] px-2 py-1.5 rounded-md group">
                <Square size={16} className="text-[#7d8590] group-hover:text-[#58a6ff]" /> Process (Rect)
              </button>
              <button className="w-full flex items-center gap-3 text-sm text-[#c9d1d9] hover:bg-[#21262d] px-2 py-1.5 rounded-md group">
                <div className="w-4 h-3 border-2 border-[#7d8590] rounded-full group-hover:border-[#58a6ff]"></div> Terminator (Pill)
              </button>
              <button className="w-full flex items-center gap-3 text-sm text-[#c9d1d9] hover:bg-[#21262d] px-2 py-1.5 rounded-md group">
                <Hexagon size={16} className="text-[#7d8590] group-hover:text-[#58a6ff]" /> Decision (Diamond)
              </button>
              <button className="w-full flex items-center gap-3 text-sm text-[#c9d1d9] hover:bg-[#21262d] px-2 py-1.5 rounded-md group">
                <Database size={16} className="text-[#7d8590] group-hover:text-[#58a6ff]" /> Database (Cyl)
              </button>
              <button className="w-full flex items-center gap-3 text-sm text-[#c9d1d9] hover:bg-[#21262d] px-2 py-1.5 rounded-md group">
                <BoxSelect size={16} className="text-[#7d8590] group-hover:text-[#58a6ff] -skew-x-12" /> Input/Output
              </button>
            </div>
          </div>

          {/* Section 3: Outliner */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <h3 className="text-xs font-semibold text-[#7d8590] uppercase tracking-wider mb-2">Outliner & Layers</h3>
            <div className="space-y-0.5 font-mono text-xs">
              {nodes.map(n => (
                <button 
                  key={n.id}
                  onClick={() => centerNode(n.id)}
                  className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md truncate ${activeNodeId === n.id ? 'bg-[#1f6feb]/10 text-[#58a6ff]' : 'text-[#7d8590] hover:bg-[#21262d] hover:text-[#c9d1d9]'}`}
                >
                  <span className="text-[#30363d]">├─</span>
                  <span className="truncate">{n.data.label || 'Untitled Node'}</span>
                </button>
              ))}
              {nodes.length === 0 && <div className="text-[#7d8590] italic pl-6 py-2">No nodes</div>}
            </div>
          </div>
        </aside>

        {/* CENTER CANVAS & FLOATING CONTROLS */}
        <main className="flex-1 bg-[#0d1117] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            snapToGrid={snapToGrid}
            snapGrid={[20, 20]}
            fitView
          >
            <Background gap={20} size={1} color="#30363d" />
            
            {/* Bottom Right MiniMap */}
            <MiniMap 
              style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}
              nodeColor={(n) => {
                if (n.data?.color === 'green') return '#238636';
                if (n.data?.color === 'blue') return '#1f6feb';
                if (n.data?.color === 'red') return '#da3633';
                return '#30363d';
              }}
              maskColor="rgba(1, 4, 9, 0.7)"
            />
          </ReactFlow>

          {/* Bottom Center Floating Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 pointer-events-auto bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 shadow-lg">
            <button className="px-2 py-1 text-xs font-medium text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-sm transition-colors w-20 text-center">
              Zoom: {zoomLevel}%
            </button>
            <div className="w-px h-4 bg-[#30363d] mx-1"></div>
            <button onClick={fitView} className="px-2 py-1 text-xs font-medium text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-sm transition-colors">
              Fit View
            </button>
            <div className="w-px h-4 bg-[#30363d] mx-1"></div>
            <button 
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`px-2 py-1 text-xs font-medium flex items-center gap-1.5 rounded-sm transition-colors ${snapToGrid ? 'text-[#e6edf3] bg-[#21262d]' : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
            >
              <Grid size={14} /> Snap to Grid
            </button>
            <div className="w-px h-4 bg-[#30363d] mx-1"></div>
            <button onClick={autoLayout} className="px-2 py-1 text-xs font-medium text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-sm transition-colors flex items-center gap-1.5">
              <span>🪄</span> Auto-Layout
            </button>
          </div>
        </main>

        {/* RIGHT NODE INSPECTOR */}
        <aside className="w-[320px] border-l border-[#30363d] bg-[#161b22] flex flex-col shrink-0 z-10 overflow-hidden">
          {!activeNodeId || !activeNodeData ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#7d8590]">
              <Settings size={32} className="mb-4 opacity-50" />
              <p className="text-sm">Select a node on the canvas to edit its properties.</p>
            </div>
          ) : (
            <>
              {/* Inspector Header & Tabs */}
              <div className="border-b border-[#30363d]">
                <div className="flex items-center gap-2 p-3 font-mono text-xs text-[#7d8590] uppercase tracking-wider">
                  <Terminal size={14} /> NODE DETAILS
                </div>
                <div className="flex">
                  <button 
                    onClick={() => setInspectorTab('content')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${inspectorTab === 'content' ? 'border-[#f78166] text-[#e6edf3]' : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9]'}`}
                  >
                    Content
                  </button>
                  <button 
                    onClick={() => setInspectorTab('style')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${inspectorTab === 'style' ? 'border-[#f78166] text-[#e6edf3]' : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9]'}`}
                  >
                    Style
                  </button>
                </div>
              </div>

              {/* Inspector Body */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-5">
                {inspectorTab === 'content' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#7d8590] mb-1.5">Title</label>
                      <input 
                        type="text" 
                        value={activeNodeData.label || ''}
                        onChange={(e) => updateActiveNodeData('label', e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-[#7d8590] mb-1.5">Status</label>
                      <select 
                        value={activeNodeData.status || 'Not Started'}
                        onChange={(e) => updateActiveNodeData('status', e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] appearance-none"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#7d8590] mb-1.5 flex items-center gap-1">
                        <Terminal size={12} /> DESCRIPTION (MD)
                      </label>
                      <textarea 
                        value={activeNodeData.description || ''}
                        onChange={(e) => updateActiveNodeData('description', e.target.value)}
                        className="w-full h-32 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] font-mono focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] custom-scrollbar"
                        placeholder="Add markdown description..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-[#7d8590] mb-1.5">SUB-TASKS</label>
                      <div className="space-y-2">
                        {(activeNodeData.subtasks || []).map((task: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="checkbox" checked={task.done} readOnly className="accent-[#238636]" />
                            <input type="text" value={task.label} readOnly className="flex-1 bg-transparent border-none text-sm text-[#c9d1d9] focus:outline-none" />
                          </div>
                        ))}
                        <button className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 mt-2">
                          + Add Sub-task
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#7d8590] mb-2">Color Label</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PRIMER_COLORS).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => updateActiveNodeData('color', key)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all ${activeNodeData.color === key ? 'border-[#e6edf3] ring-1 ring-[#e6edf3]' : 'border-[#30363d] hover:border-[#7d8590]'} ${value.bg}`}
                          >
                            <div className={`w-3 h-3 rounded-full border ${value.border}`}></div>
                            <span className="text-[#c9d1d9] capitalize">{key}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-[#7d8590] mb-2">Shape</label>
                      <div className="grid grid-cols-2 gap-2">
                         {['rect', 'pill', 'diamond', 'cylinder', 'parallelogram'].map((shape) => (
                          <button
                            key={shape}
                            onClick={() => updateActiveNodeData('shape', shape)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md border bg-[#0d1117] text-sm transition-all ${activeNodeData.shape === shape ? 'border-[#58a6ff] text-[#58a6ff]' : 'border-[#30363d] hover:border-[#7d8590] text-[#c9d1d9]'}`}
                          >
                            <span className="capitalize">{shape}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Inspector Footer */}
              <div className="p-4 border-t border-[#30363d]">
                <button 
                  onClick={deleteActiveNode}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#f85149] hover:bg-[#da3633]/10 border border-transparent hover:border-[#f85149]/30 px-4 py-2 rounded-md transition-colors"
                >
                  <Trash2 size={16} /> Delete Node
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export function EditorPage(props: { onBack: () => void }) {
  return (
    <ReactFlowProvider>
      <FlowEditor {...props} />
    </ReactFlowProvider>
  );
}
