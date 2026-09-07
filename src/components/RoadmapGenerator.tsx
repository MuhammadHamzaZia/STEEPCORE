import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Loader2, Search, ArrowLeft, X, Sparkles, MessageSquare, Send, MapPin } from 'lucide-react';
import { EditableNode, cn } from './EditableNode';
import { parseRoadmapToElements, RoadmapData, getLayoutedElements } from '../lib/flow';
import { api } from '../services/api';

interface RoadmapGeneratorProps {
  initialRole?: string;
  onBack?: () => void;
}

export const RoadmapGenerator = ({ initialRole, onBack }: RoadmapGeneratorProps) => {
  const [role, setRole] = useState(initialRole || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const [expansionPrompt, setExpansionPrompt] = useState("");
  const [expansionLevel, setExpansionLevel] = useState("basic");
  const [isExpanding, setIsExpanding] = useState(false);
  const [regionalInsight, setRegionalInsight] = useState<string | null>(null);
  const [localResources, setLocalResources] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = { role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          context: { role: role }
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };


  const handleExpandNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !expansionPrompt.trim()) return;
    setIsExpanding(true);
    try {
      const response = await fetch('/api/expand-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeLabel: selectedNode.data.label,
          nodeType: selectedNode.data.type,
          promptContext: expansionPrompt.trim(),
          expansionType: expansionLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to expand node.');
      }

      const data = await response.json();
      
      let newElements: Node[] = [];
      let newEdges: Edge[] = [];
      const parentId = selectedNode.id;

      if (data.phases && Array.isArray(data.phases)) {
        data.phases.forEach((phase: any, pIdx: number) => {
          const phaseId = `exp-phase-${parentId}-${Date.now()}-${pIdx}`;
          newElements.push({
            id: phaseId,
            type: 'editable',
            data: { label: phase.title, type: 'phase', description: phase.description },
            position: { x: 0, y: 0 }
          });
          newEdges.push({
            id: `e-${parentId}-${phaseId}`,
            source: parentId,
            target: phaseId,
            type: 'smoothstep',
            animated: true,
          });

          phase.topics?.forEach((topic: any, tIdx: number) => {
            const topicId = `exp-topic-${phaseId}-${tIdx}`;
            newElements.push({
              id: topicId,
              type: 'editable',
              data: { label: topic.name, type: 'topic' },
              position: { x: 0, y: 0 }
            });
            newEdges.push({
              id: `e-${phaseId}-${topicId}`,
              source: phaseId,
              target: topicId,
              type: 'smoothstep',
            });

            topic.concepts?.forEach((concept: string, cIdx: number) => {
              const conceptId = `exp-concept-${topicId}-${cIdx}`;
              newElements.push({
                id: conceptId,
                type: 'editable',
                data: { label: concept, type: 'concept' },
                position: { x: 0, y: 0 }
              });
              newEdges.push({
                id: `e-${topicId}-${conceptId}`,
                source: topicId,
                target: conceptId,
                type: 'smoothstep',
              });
            });
          });
        });
      } else if (data.newNodes && Array.isArray(data.newNodes)) {
        newElements = data.newNodes.map((n: any, idx: number) => ({
          id: `expanded-${parentId}-${Date.now()}-${idx}`,
          type: 'editable',
          data: { label: n.name, type: n.type || 'concept' },
          position: { x: 0, y: 0 }
        }));

        newEdges = newElements.map((n: any) => ({
          id: `e-${parentId}-${n.id}`,
          source: parentId,
          target: n.id,
          type: 'smoothstep',
        }));
      }

      if (newElements.length > 0) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          [...nodes, ...newElements],
          [...edges, ...newEdges],
          'TB'
        );
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
      
      setExpansionPrompt("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred expanding the node.');
    } finally {
      setIsExpanding(false);
    }
  };

  const generateRoadmapFromRole = async (targetRole: string) => {
    if (!targetRole.trim()) return;

    setIsLoading(true);
    setError(null);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setRegionalInsight(null);
    setLocalResources([]);
    setChatMessages([]);

    try {
      // 1. First attempt call to live STEEPCOREAPI (/api/Ai/generate)
      try {
        const aiData = await api.generateAiBlueprint({
          prompt: targetRole.trim(),
          topic: targetRole.trim(),
          targetRole: targetRole.trim(),
          level: 'intermediate',
        });

        if (aiData && Array.isArray(aiData.nodes) && aiData.nodes.length > 0) {
          const formattedNodes: Node[] = aiData.nodes.map((n: any, idx: number) => ({
            id: String(n.id || `node-${idx}`),
            type: 'editable',
            data: {
              label: n.title || n.label || n.name || `Step ${idx + 1}`,
              type: n.type || 'topic',
              description: n.description || '',
            },
            position: n.coordinates || n.position || { x: (idx % 3) * 240 + 50, y: Math.floor(idx / 3) * 160 + 50 },
          }));

          const formattedEdges: Edge[] = (aiData.edges || []).map((e: any, idx: number) => ({
            id: String(e.id || `edge-${idx}`),
            source: String(e.source || e.sourceId || formattedNodes[Math.max(0, idx - 1)]?.id),
            target: String(e.target || e.targetId || formattedNodes[idx]?.id),
            label: e.label || e.relationshipLabel,
            type: 'smoothstep',
            animated: true,
          }));

          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            formattedNodes,
            formattedEdges.length > 0 ? formattedEdges : formattedNodes.slice(1).map((n, i) => ({
              id: `e-${formattedNodes[i].id}-${n.id}`,
              source: formattedNodes[i].id,
              target: n.id,
              type: 'smoothstep',
              animated: true
            })),
            'TB'
          );

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          return;
        }
      } catch (aiErr) {
        console.warn("STEEPCOREAPI AI endpoint call failed or returned custom format, trying secondary solver:", aiErr);
      }

      // 2. Secondary fallback via local express generator endpoint
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language;

      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole.trim(), timeZone, locale }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to generate roadmap. Please try again.';
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data: RoadmapData = await response.json();
      
      setRegionalInsight(data.regionalInsight || null);
      setLocalResources(data.localResources || []);
      const { nodes: initialNodes, edges: initialEdges } = parseRoadmapToElements(data);
      setNodes(initialNodes);
      setEdges(initialEdges);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialRole) {
      generateRoadmapFromRole(initialRole);
    }
  }, [initialRole]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const onLabelChange = useCallback((id: string, newLabel: string) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, label: newLabel };
        }
        return node;
      })
    );
    setSelectedNode((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, data: { ...prev.data, label: newLabel } };
      }
      return prev;
    });
  }, [setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const closePanel = () => setSelectedNode(null);

  const nodeTypes = useMemo(() => ({
    editable: (props: any) => <EditableNode {...props} data={{...props.data, onLabelChange}} />
  }), [onLabelChange]);

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateRoadmapFromRole(role);
  };

  const handleSelectedNodeChange = (key: string, value: string) => {
    if (!selectedNode) return;
    
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, [key]: value } };
        }
        return node;
      })
    );
    setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, [key]: value } } : null);
  };

  return (
    <div className="flex-1 w-full flex flex-col relative bg-canvas-default text-fg-default font-sans overflow-hidden">
      <div className="h-14 border-b border-border-default flex items-center justify-between px-6 bg-canvas-surface gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-canvas-inset transition-colors text-fg-muted hover:text-fg-default"
              title="Back to start"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-sm font-semibold text-fg-default">Roadmap Canvas</h2>
        </div>

        <form onSubmit={generateRoadmap} className="flex flex-1 max-w-sm">
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Target role..."
            className="w-full pl-3 pr-2 py-1 rounded-l-md border border-border-default bg-canvas-inset text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !role.trim()}
            className="bg-canvas-inset border border-border-default border-l-0 text-fg-default hover:text-action-accent hover:bg-canvas-surface px-3 py-1 rounded-r-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      <div className="flex-1 relative w-full h-full flex flex-row overflow-hidden bg-canvas-default">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F85149]/10 border border-[#F85149]/50 text-[#F85149] px-4 py-2 rounded-md shadow-none text-sm">
            {error}
          </div>
        )}
        
        {nodes.length === 0 && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-fg-muted z-0">
            <div className="bg-canvas-surface p-8 rounded-lg border border-border-default text-center max-w-md">
              <div className="w-10 h-10 rounded-md bg-canvas-inset border border-border-default flex items-center justify-center mx-auto mb-4">
                <Search className="w-5 h-5 text-fg-muted" />
              </div>
              <h2 className="text-base font-semibold text-fg-default mb-2">No Roadmap Generated</h2>
              <p className="text-sm text-fg-muted">Enter a target role designation above to generate a comprehensive learning node path.</p>
            </div>
          </div>
        )}

        <div className="flex-1 h-full relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                style: { stroke: 'var(--color-border-default)', strokeWidth: 2 },
                animated: true,
              }}
              fitView
              minZoom={0.1}
              attributionPosition="bottom-right"
              className="[&_.react-flow__controls]:bg-canvas-surface [&_.react-flow__controls]:border-border-default [&_.react-flow__controls_button]:border-b-border-default [&_.react-flow__controls_button]:bg-canvas-surface [&_.react-flow__controls_button]:fill-fg-muted [&_.react-flow__controls_button:hover]:bg-canvas-inset"
            >
              <Background gap={32} size={1} color="var(--color-border-default)" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {selectedNode && (
          <div className="w-80 h-full bg-canvas-surface border-l border-border-default flex flex-col z-20 shrink-0 relative">
            <div className="px-4 py-3 border-b border-border-default flex items-center justify-between shrink-0 bg-canvas-inset">
              <h3 className="text-sm font-semibold text-fg-default flex items-center gap-2">
                Node Properties
              </h3>
              <button 
                onClick={closePanel}
                className="text-fg-muted hover:text-fg-default p-1 rounded-md hover:bg-canvas-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-sm">
              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1 uppercase">Type</label>
                <div className="px-2 py-1 border border-border-default rounded-md bg-canvas-inset text-fg-default inline-block capitalize">
                  {selectedNode.data?.type as string || 'Unknown'}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1 uppercase">Label</label>
                <textarea
                  value={selectedNode.data?.label as string || ''}
                  onChange={(e) => handleSelectedNodeChange('label', e.target.value)}
                  className="w-full bg-canvas-default border border-border-default rounded-md px-3 py-2 text-fg-default focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent resize-none h-16 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1 uppercase">Description</label>
                <textarea
                  value={selectedNode.data?.description as string || ''}
                  onChange={(e) => handleSelectedNodeChange('description', e.target.value)}
                  placeholder="Add notes here..."
                  className="w-full bg-canvas-default border border-border-default rounded-md px-3 py-2 text-fg-default focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent min-h-[100px] resize-y transition-all"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border-default bg-canvas-inset shrink-0">
              <h4 className="text-xs font-semibold text-fg-default mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-action-accent" /> AI Expansion
              </h4>
              <form 
                onSubmit={handleExpandNode}
                className="flex flex-col gap-2"
              >
                <select
                  value={expansionLevel}
                  onChange={(e) => setExpansionLevel(e.target.value)}
                  className="w-full bg-canvas-default border border-border-default rounded-md px-2 py-1.5 text-fg-default text-sm focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent"
                >
                  <option value="basic">Basic Topics</option>
                  <option value="detailed">Detailed Structure</option>
                  <option value="tools">Tools & Tech</option>
                  <option value="resources">Resources</option>
                </select>
                <input
                  type="text"
                  value={expansionPrompt}
                  onChange={(e) => setExpansionPrompt(e.target.value)}
                  placeholder="Prompt..."
                  className="w-full bg-canvas-default border border-border-default rounded-md px-2 py-1.5 text-fg-default text-sm focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent placeholder:text-fg-muted"
                />
                <button
                  type="submit"
                  disabled={isExpanding || !expansionPrompt.trim()}
                  className="bg-action-primary hover:bg-action-primary-hover text-white px-3 py-1.5 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full"
                >
                  {isExpanding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isExpanding ? 'Expanding...' : 'Generate Details'}
                </button>
              </form>
            </div>
          </div>
        )}
      
        {/* Chat Assistant */}
        <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end">
          {chatOpen && (
            <div className="w-80 h-[350px] bg-canvas-surface border border-border-default rounded-lg mb-2 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
              <div className="p-3 border-b border-border-default bg-canvas-inset flex items-center justify-between">
                <h3 className="text-fg-default text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-action-accent" />
                  Assistant
                </h3>
                <button onClick={() => setChatOpen(false)} className="text-fg-muted hover:text-fg-default p-1"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-fg-muted">
                    <p className="text-sm">Ask me anything!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-md px-2.5 py-1.5 text-sm ${msg.role === 'user' ? 'bg-canvas-inset border border-border-default text-fg-default' : 'bg-transparent text-fg-default'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="text-fg-muted px-2.5 py-1.5 text-sm flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="p-2 border-t border-border-default bg-canvas-surface flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-canvas-default border border-border-default rounded-md px-2 py-1.5 text-fg-default text-sm focus:outline-none focus:border-action-accent"
                />
                <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="bg-canvas-inset border border-border-default hover:bg-canvas-default text-fg-default px-2 py-1.5 rounded-md transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
          
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="w-10 h-10 bg-canvas-inset border border-border-default hover:bg-canvas-surface text-fg-default rounded-md flex items-center justify-center transition-all"
          >
            {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};
