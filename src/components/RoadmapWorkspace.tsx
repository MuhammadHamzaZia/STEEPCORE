import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertCircle, Search, ArrowLeft, X, Sparkles, MessageSquare, Send, 
  LayoutDashboard, Save, MousePointer2, Settings, BoxSelect, Trash2, Menu, 
  Circle, Square, Hexagon, Database, Grid, Download, Image as ImageIcon,
  Lock
} from 'lucide-react';
import { EditableNode, cn } from './EditableNode';
import { getLayoutedElements } from '../lib/flow';
import { api } from '../services/api';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { useUIStore } from '../store/useUIStore';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

const nodeTypes = {
  editable: EditableNode,
};

interface RoadmapWorkspaceProps {
  initialRole?: string;
  initialBlueprintId?: string;
  onBack?: () => void;
}

function WorkspaceCore({ initialRole, initialBlueprintId, onBack }: RoadmapWorkspaceProps) {
  const reactFlowInstance = useReactFlow();
  const { isAuthenticated } = useAuthStore();
  const { setIsAuthModalOpen } = useUIStore();
  const { activeRoadmaps, markNodeCompleted, setRoadmapState, initializeRoadmap } = useLibraryStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentBlueprintId, setCurrentBlueprintId] = useState<string | undefined>(initialBlueprintId);
  
  // UI State
  const [leftSidebarTab, setLeftSidebarTab] = useState<'tools' | 'chat'>('tools');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Inspector State
  const [nodeLabel, setNodeLabel] = useState("");
  
  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [savePrice, setSavePrice] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;
    
    setIsSaving(true);
    try {
      const payload = {
        title: saveTitle,
        description: saveDesc,
        price: savePrice,
        isPublished: isPublic,
        nodes: nodes.map(n => ({          label: typeof n.data.label === 'string' ? n.data.label : 'Node',          type: typeof n.data.type === 'string' ? n.data.type : 'topic',          description: typeof n.data.description === 'string' ? n.data.description : undefined,          positionX: n.position.x,          positionY: n.position.y        })),
        edges: edges.map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          const targetNode = nodes.find(n => n.id === e.target);
          return {
            source: sourceNode ? sourceNode.data.label : e.source,
            target: targetNode ? targetNode.data.label : e.target,
            label: e.label ? String(e.label) : ''
          };
        })
      };
      
      
      try {
        if (currentBlueprintId) {
          await apiClient.put(`/api/Blueprints/${currentBlueprintId}`, payload);
        } else {
          const res = await apiClient.post<any>('/api/Blueprints', payload);
          if (res && res.id) {
            setCurrentBlueprintId(res.id);
          } else if (res && res.blueprint && res.blueprint.id) {
            setCurrentBlueprintId(res.blueprint.id);
          }
        }
      } catch (err: any) {
        if (err.message?.includes('401')) {
          setIsAuthModalOpen(true);
        } else {
          alert('Failed to save roadmap.');
        }
        return;
      }
      
      setIsSaveModalOpen(false);
      alert('Roadmap saved successfully to your profile!');
    } catch (err) {
      console.error(err);
      alert('Error saving roadmap.');
    } finally {
      setIsSaving(false);
    }
  };

  
    const handleDownloadPdf = async () => {
    const { getNodes } = reactFlowInstance;
    const nodes = getNodes();
    if (nodes.length === 0) return;
    
    // We capture the viewport which contains the nodes, not the container, 
    // so it doesn't include controls/minimap automatically.
    const element = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!element) return;
    
    try {
      const nodesBounds = getNodesBounds(nodes);
      const padding = 50;
      
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;
      
      const transform = getViewportForBounds(
        nodesBounds,
        width,
        height,
        0.5,
        2,
        0.1 // padding
      );
      
      const dataUrl = await toPng(element, {
        backgroundColor: '#0d1117',
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
      });
      
      // We will create a paginated A4 document if it's large, ensuring 100% readability.
      // Standard A4 dimensions in px (72 dpi)
      const a4Width = 595.28;
      const a4Height = 841.89;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [a4Width, a4Height]
      });
      
      const pagesX = Math.ceil(width / a4Width);
      const pagesY = Math.ceil(height / a4Height);
      
      for (let y = 0; y < pagesY; y++) {
        for (let x = 0; x < pagesX; x++) {
          if (x > 0 || y > 0) {
            pdf.addPage([a4Width, a4Height], 'portrait');
          }
          pdf.addImage(dataUrl, 'PNG', -x * a4Width, -y * a4Height, width, height);
        }
      }
      
      pdf.save(`${currentBlueprintId ? 'blueprint-' + currentBlueprintId : 'roadmap'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

const openSaveModal = () => {
    // Check login
    if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
    }
    setSaveTitle(initialRole || 'Custom Roadmap');
    setIsSaveModalOpen(true);
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)), [setEdges]);

  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (initialRole && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateRoadmap(initialRole);
    } else if (initialBlueprintId) {
      loadBlueprint(initialBlueprintId);
    }
  }, [initialRole, initialBlueprintId]);

  // Immediately remove completed node indicators if user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setNodes(nds => nds.map(n => ({
        ...n,
        data: {
          ...n.data,
          isCompleted: false
        }
      })));
    }
  }, [isAuthenticated]);

  const loadBlueprint = async (id: string) => {
    setIsLoading(true);
    try {
      const bp = await api.getBlueprintById(id);
      if (bp) {
          let fetchedCompletedNodes: string[] = [];
          try {
            if (isAuthenticated) {
              const progressData = await api.getUserProgress(id);
              if (progressData && Array.isArray(progressData)) {
                fetchedCompletedNodes = progressData.filter(p => p.status === 'completed').map(p => p.nodeId);
                const progressPct = bp.nodesCount ? Math.round((fetchedCompletedNodes.length / bp.nodesCount) * 100) : 0;
                setRoadmapState(id, fetchedCompletedNodes, progressPct);
              }
            }
          } catch(e) {
            console.error("Failed to load progress", e);
          }
          setSaveTitle(bp.title || initialRole || 'Custom Roadmap');
          setSaveDesc(bp.description || '');
          setSavePrice(bp.price || 0);
          setIsPublic(bp.isPublished || false);
          
          const bpNodes = (bp as any).nodes || [];
          const initialNodes: Node[] = bpNodes.map((n: any) => ({
            id: String(n.id),
            type: 'editable',
            position: { x: n.positionX || Math.random() * 500, y: n.positionY || Math.random() * 500 },
            data: {
              label: n.label,
              type: n.type || 'topic',
              description: n.description || '',
              color: 'default',
              isCompleted: fetchedCompletedNodes.includes(String(n.id))
            },
          }));
          setNodes(initialNodes);
          
          const bpEdges = (bp as any).edges || [];
          const initialEdges: Edge[] = bpEdges.map((e: any) => ({
            id: String(e.id),
            source: String(e.sourceNodeId),
            target: String(e.targetNodeId),
            label: e.label || '',
            type: 'smoothstep',
            animated: true
          }));
          setEdges(initialEdges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoadmap = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    try {
      const aiData = await api.generateAiBlueprint({ prompt });
      if (aiData && Array.isArray(aiData.nodes) && aiData.nodes.length > 0) {
        const formattedNodes: Node[] = aiData.nodes.map((n: any, idx: number) => ({
          id: String(n.id || `node-${idx}`),
          type: 'editable',
          data: {
            label: n.title || n.label || n.name || `Step ${idx + 1}`,
            type: n.type || 'topic',
            description: n.description || '',
          },
          position: n.coordinates || (n.positionX !== undefined && n.positionY !== undefined && (n.positionX !== 0 || n.positionY !== 0) ? { x: n.positionX, y: n.positionY } : { x: (idx % 3) * 240 + 50, y: Math.floor(idx / 3) * 160 + 50 }),
        }));
        const formattedEdges: Edge[] = (aiData.edges || []).map((e: any, idx: number) => ({
          id: String(e.id || `edge-${idx}`),
          source: String(e.source || e.sourceNodeId || formattedNodes[Math.max(0, idx - 1)]?.id),
          target: String(e.target || e.targetNodeId || formattedNodes[idx]?.id),
          label: e.label || e.relationshipLabel,
          type: 'smoothstep',
          animated: true,
        }));
        
        const edgesToUse = formattedEdges.length > 0 ? formattedEdges : formattedNodes.slice(1).map((n, i) => ({
          id: `e-${formattedNodes[i].id}-${n.id}`,
          source: formattedNodes[i].id,
          target: n.id,
          type: 'smoothstep',
          animated: true
        }));
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(formattedNodes, edgesToUse, 'TB');
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'An error occurred while generating the roadmap.';
      if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
        setErrorMsg('The AI free generation quota has been exceeded. Please try again later.');
      } else {
        setErrorMsg(msg);
      }
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const data = await apiClient.post<any>('/api/ai/Chat', { 
        messages: [...chatMessages, userMsg], 
        context: { role: initialRole, nodes, edges } 
      });
      if (data.error) throw new Error(data.error);
      setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);
      
      if (data.actions && Array.isArray(data.actions)) {
        let currentNodes = reactFlowInstance.getNodes();
        let currentEdges = reactFlowInstance.getEdges();
        let needsLayout = false;

        data.actions.forEach((action: any) => {
          if (action.type === 'ADD_NODE') {
            const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newNode = {
              id: newNodeId,
              type: 'editable',
              data: { label: action.node.title, type: action.node.type || 'topic', description: action.node.description || '' },
              position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 }
            };
            currentNodes = [...currentNodes, newNode];
            if (action.sourceNodeId) {
              currentEdges = [...currentEdges, {
                id: `e-${action.sourceNodeId}-${newNodeId}`,
                source: action.sourceNodeId,
                target: newNodeId,
                type: 'smoothstep',
                animated: true
              }];
            }
          } else if (action.type === 'ADD_MULTIPLE_NODES') {
            needsLayout = true;
            if (Array.isArray(action.nodes)) {
               const newNodesList = action.nodes.map((n: any) => ({
                 id: String(n.id),
                 type: 'editable',
                 data: { label: n.title, type: n.type || 'topic', description: n.description || '' },
                 position: { x: 0, y: 0 }
               }));
               const newEdgesList = action.nodes
                 .filter((n: any) => n.sourceNodeId)
                 .map((n: any) => ({
                   id: `e-${n.sourceNodeId}-${n.id}`,
                   source: String(n.sourceNodeId),
                   target: String(n.id),
                   type: 'smoothstep',
                   animated: true
                 }));
               currentNodes = [...currentNodes, ...newNodesList];
               currentEdges = [...currentEdges, ...newEdgesList];
            }
          } else if (action.type === 'UPDATE_NODE') {
            currentNodes = currentNodes.map(n => {
              const nodeLabel = String((n.data as any)?.label || '');
              if (n.id === action.nodeId || nodeLabel.toLowerCase() === String(action.nodeId).toLowerCase()) {
                return { ...n, data: { ...n.data, ...action.updates } };
              }
              return n;
            });
          } else if (action.type === 'DELETE_NODE') {
            currentNodes = currentNodes.filter(n => {
              const nodeLabel = String((n.data as any)?.label || '');
              return n.id !== action.nodeId && nodeLabel.toLowerCase() !== String(action.nodeId).toLowerCase();
            });
            currentEdges = currentEdges.filter(e => e.source !== action.nodeId && e.target !== action.nodeId);
          }
        });

        if (needsLayout) {
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(currentNodes, currentEdges, 'TB');
          currentNodes = layoutedNodes;
          currentEdges = layoutedEdges;
          setTimeout(() => reactFlowInstance.fitView({ duration: 800, padding: 0.2 }), 50);
        }

        setNodes(currentNodes);
        setEdges(currentEdges);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: 'Failed to get response.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length > 0) {
      setSelectedNode(nodes[0]);
      setNodeLabel(nodes[0].data.label as string);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const updateNodeLabel = (val: string) => {
    setNodeLabel(val);
    if (selectedNode) {
      setNodes((nds) => nds.map((n) => {
        if (n.id === selectedNode.id) {
          n.data = { ...n.data, label: val };
        }
        return n;
      }));
    }
  };

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'editable',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: `New ${type}`, type },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'TB');
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setTimeout(() => reactFlowInstance.fitView({ duration: 800, padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

  return (
    <div className="flex flex-col h-screen w-full bg-canvas-default text-fg-default font-sans overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-14 border-b border-border-default bg-canvas-surface flex items-center justify-between px-3 sm:px-4 z-50 flex-nowrap">
        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-1.5 sm:p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="p-1.5 sm:p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-border-default mx-1"></div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-action-accent" />
            <span className="hidden sm:inline">Workspace</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-2 py-1.5 sm:px-3 text-sm bg-canvas-inset border border-border-default hover:bg-canvas-default rounded-md transition-colors">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download PDF</span></button>
          <button onClick={onLayout} className="flex items-center gap-2 px-2 py-1.5 sm:px-3 text-sm bg-canvas-inset border border-border-default hover:bg-canvas-default rounded-md transition-colors">
            <Grid className="w-4 h-4" /> <span className="hidden sm:inline">Layout</span></button>
          <button onClick={openSaveModal} className="flex items-center gap-2 px-2 py-1.5 sm:px-3 text-sm bg-action-primary hover:bg-action-primary-hover text-white rounded-md transition-colors">
            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save</span></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Left Sidebar */}
        <div className={`absolute md:relative z-30 h-full w-80 md:w-80 border-r border-border-default bg-canvas-surface flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="flex border-b border-border-default">
            <button 
              onClick={() => setLeftSidebarTab('tools')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${leftSidebarTab === 'tools' ? 'border-action-accent text-fg-default' : 'border-transparent text-fg-muted hover:text-fg-default'}`}
            >
              Tools
            </button>
            <button 
              onClick={() => setLeftSidebarTab('chat')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${leftSidebarTab === 'chat' ? 'border-action-accent text-fg-default' : 'border-transparent text-fg-muted hover:text-fg-default'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {leftSidebarTab === 'tools' && (
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">Add Node</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => addNode('topic')} className="flex flex-col items-center justify-center gap-2 p-3 bg-canvas-inset border border-border-default hover:border-action-accent rounded-md transition-colors group">
                      <Square className="w-5 h-5 text-fg-muted group-hover:text-action-accent" />
                      <span className="text-xs">Topic</span>
                    </button>
                    <button onClick={() => addNode('concept')} className="flex flex-col items-center justify-center gap-2 p-3 bg-canvas-inset border border-border-default hover:border-action-accent rounded-md transition-colors group">
                      <Circle className="w-5 h-5 text-fg-muted group-hover:text-action-accent" />
                      <span className="text-xs">Concept</span>
                    </button>
                    <button onClick={() => addNode('decision')} className="flex flex-col items-center justify-center gap-2 p-3 bg-canvas-inset border border-border-default hover:border-action-accent rounded-md transition-colors group">
                      <Hexagon className="w-5 h-5 text-fg-muted group-hover:text-action-accent" />
                      <span className="text-xs">Decision</span>
                    </button>
                    <button onClick={() => addNode('database')} className="flex flex-col items-center justify-center gap-2 p-3 bg-canvas-inset border border-border-default hover:border-action-accent rounded-md transition-colors group">
                      <Database className="w-5 h-5 text-fg-muted group-hover:text-action-accent" />
                      <span className="text-xs">Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {leftSidebarTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-fg-muted space-y-3">
                      <MessageSquare className="w-8 h-8 opacity-20" />
                      <p className="text-sm">I can help expand this roadmap, explain concepts, or suggest new nodes.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-md px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-action-primary text-white' : 'bg-canvas-inset border border-border-default text-fg-default'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="text-fg-muted px-3 py-2 text-sm flex items-center gap-2">
                        <img src="/loader.svg" alt="Loading"  className="w-4 h-4 animate-spin object-contain"  /> Thinking...
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border-default bg-canvas-surface">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AI assistant..."
                      className="w-full bg-canvas-default border border-border-default rounded-full pl-4 pr-10 py-2 text-sm text-fg-default focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent transition-all"
                    />
                    <button 
                      type="submit" 
                      disabled={!chatInput.trim() || isChatLoading}
                      className="absolute right-1.5 p-1.5 bg-action-primary hover:bg-action-primary-hover text-white rounded-full transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 relative bg-[#0d1117]">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-canvas-default/80 backdrop-blur-md transition-all duration-300">
              <div className="bg-canvas-surface border border-border-default rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center text-center relative max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute inset-0 bg-action-primary/5 blur-3xl rounded-full"></div>
                <img src="/loader.svg" alt="Loading" className="w-12 h-12 animate-spin mb-4 object-contain drop-shadow-md z-10" />
                <p className="text-fg-muted text-sm font-medium flex items-center gap-2 z-10 bg-canvas-inset px-4 py-1.5 rounded-full border border-border-default">
                  <span className="inline-block w-2 h-2 rounded-full bg-action-primary animate-pulse shadow-[0_0_8px_rgba(35,134,54,0.6)]"></span>
                  Generating vectors...
                </p>
              </div>
            </div>
          )}
          <ReactFlow
            proOptions={{ hideAttribution: true }}
            nodes={nodes.map(n => ({
              ...n,
              data: {
                ...n.data,
                isCompleted: currentBlueprintId && activeRoadmaps[currentBlueprintId]?.completedNodes?.includes(n.id)
              }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            className="roadmap-flow"
            minZoom={0.1}
            maxZoom={2}
          >
            <Background color="#30363d" gap={20} size={1} />
            <Controls className="!bg-canvas-surface !border-border-default !shadow-xl [&>button]:!border-b-border-default [&>button]:!bg-canvas-surface [&>button]:!text-fg-default [&>button:hover]:!bg-canvas-inset" />
          </ReactFlow>
        </div>

        {/* Right Sidebar (Inspector) */}
        {selectedNode && (
          <div className="w-80 border-l border-border-default bg-canvas-surface flex flex-col z-10 animate-in slide-in-from-right-8 duration-200">
            <div className="h-12 border-b border-border-default flex items-center px-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-fg-muted" />
                Inspector
              </h3>
            </div>
            
            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">Label</label>
                <input
                  type="text"
                  value={nodeLabel}
                  onChange={(e) => updateNodeLabel(e.target.value)}
                  className="w-full bg-canvas-default border border-border-default rounded-md px-3 py-2 text-sm focus:outline-none focus:border-action-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">Type</label>
                <div className="bg-canvas-default border border-border-default rounded-md px-3 py-2 text-sm text-fg-default flex items-center gap-2 capitalize">
                  {selectedNode.data.type || 'Standard'}
                </div>
              </div>

              
              
              {currentBlueprintId && (
                <div className="pt-4 border-t border-border-default">
                  {isAuthenticated ? (
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-canvas-inset rounded-md transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded border-border-default text-action-primary focus:ring-action-primary"
                        checked={activeRoadmaps[currentBlueprintId]?.completedNodes?.includes(selectedNode.id) || false}
                        onChange={async (e) => {
                          const isChecked = e.target.checked;
                          markNodeCompleted(currentBlueprintId, selectedNode.id, nodes.length);
                          setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, isCompleted: isChecked } } : n));
                          try {
                            await api.toggleNodeProgress(currentBlueprintId, selectedNode.id, isChecked ? 'completed' : 'pending');
                          } catch(err) {
                            console.error("Progress sync error", err);
                          }
                        }}
                      />
                      <span className="text-sm font-medium text-fg-default">Mark as Completed</span>
                    </label>
                  ) : (
                    <div className="p-3 bg-canvas-inset border border-border-default rounded-md text-xs text-fg-muted space-y-2">
                      <div className="flex items-center gap-1.5 text-fg-default font-medium">
                        <Lock size={13} className="text-action-accent" />
                        <span>Checkpoint Tracking</span>
                      </div>
                      <p>Sign in to your account to save checkpoint progress and sync with the database.</p>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full py-1.5 bg-action-primary hover:bg-action-primary-hover text-white rounded text-xs font-medium transition-colors"
                      >
                        Sign In to Track
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t border-border-default">
                <button 
                  onClick={deleteSelected}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-danger-fg hover:bg-danger-fg/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="absolute top-4 right-4 z-50 bg-canvas-surface border-l-4 border-l-red-500 border border-border-default px-4 py-3 rounded-md shadow-2xl flex items-start gap-3 max-w-[300px] animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 text-xs font-medium leading-relaxed text-fg-default">
            {(() => {
              try {
                const parsed = JSON.parse(errorMsg);
                if (parsed.error && parsed.error.message) return parsed.error.message;
                if (parsed.message) return parsed.message;
              } catch (e) {}
              return errorMsg;
            })()}
          </div>
          <button onClick={() => setErrorMsg(null)} className="shrink-0 hover:text-red-400 text-fg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-canvas-surface border border-border-default rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-default flex justify-between items-center">
              <h3 className="text-lg font-semibold text-fg-default flex items-center gap-2">
                <Save className="w-5 h-5 text-action-accent" /> Save Roadmap
              </h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-fg-muted hover:text-fg-default">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1">Title</label>
                <input required type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} className="w-full bg-canvas-inset border border-border-default rounded-md px-3 py-2 text-sm text-fg-default focus:border-action-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1">Description</label>
                <textarea rows={3} value={saveDesc} onChange={e => setSaveDesc(e.target.value)} className="w-full bg-canvas-inset border border-border-default rounded-md px-3 py-2 text-sm text-fg-default focus:border-action-accent focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1">Price ($)</label>
                <input type="number" min="0" step="0.01" value={savePrice} onChange={e => setSavePrice(Number(e.target.value))} className="w-full bg-canvas-inset border border-border-default rounded-md px-3 py-2 text-sm text-fg-default focus:border-action-accent focus:outline-none" />
                <p className="text-xs text-fg-muted mt-1">Set to 0 for free.</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded border-border-default text-action-accent focus:ring-action-accent" />
                <label htmlFor="public" className="text-sm font-medium text-fg-default">Publish to STEEPCORE Marketplace</label>
              </div>
              <p className="text-xs text-fg-muted ml-6">If unchecked, this roadmap will remain private on your profile.</p>
              
              <div className="pt-4 border-t border-border-default flex justify-end gap-2">
                <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg-default bg-canvas-inset hover:bg-canvas-default border border-border-default rounded-md">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-action-primary hover:bg-action-primary-hover rounded-md flex items-center disabled:opacity-50">
                  {isSaving ? <img src="/loader.svg" alt="Loading"  className="w-4 h-4 mr-2 animate-spin object-contain"  /> : null}
                  {isSaving ? 'Saving...' : 'Save Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const RoadmapWorkspace = (props: RoadmapWorkspaceProps) => {
  return (
    <ReactFlowProvider>
      <WorkspaceCore {...props} />
    </ReactFlowProvider>
  );
};
