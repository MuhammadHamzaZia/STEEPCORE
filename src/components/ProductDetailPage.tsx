import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink, Sparkles, Check, Star, ShieldCheck, Download, Code, GitBranch, Loader2, Lock } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint, FlowchartNode } from '../types/schema';

export function ProductDetailPage({ onNavigateToEditor }: { onNavigateToEditor?: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { selectedBlueprintId } = useUIStore();
  const { activeRoadmaps, markNodeCompleted } = useLibraryStore();
  
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [nodes, setNodes] = useState<FlowchartNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isAccessRequested, setIsAccessRequested] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBlueprintId) return;
      setIsLoading(true);
      try {
        const bp = await api.getBlueprintById(selectedBlueprintId);
        const bpNodes = await api.getNodesByBlueprintId(selectedBlueprintId);
        if (bp) setBlueprint(bp);
        setNodes(bpNodes);
      } catch (error) {
        console.error("Failed to fetch blueprint details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedBlueprintId]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col bg-canvas-default p-8">
        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:w-[65%] flex flex-col gap-4">
            <div className="w-full h-[300px] bg-[#161b22] animate-pulse rounded-lg"></div>
            <div className="w-3/4 h-8 bg-[#161b22] animate-pulse rounded"></div>
            <div className="w-full h-4 bg-[#161b22] animate-pulse rounded"></div>
            <div className="w-5/6 h-4 bg-[#161b22] animate-pulse rounded"></div>
          </div>
          <div className="w-full lg:w-[35%] flex flex-col gap-4">
            <div className="w-full h-64 bg-[#161b22] animate-pulse rounded-lg"></div>
            <div className="w-full h-64 bg-[#161b22] animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return <div className="p-8 text-fg-muted">Blueprint not found.</div>;
  }

  const isOwned = activeRoadmaps[blueprint.id] !== undefined;
  const isFree = blueprint.price === 0;
  const canAccess = isOwned || isFree;

  const handlePurchaseOrOpen = async () => {
    if (!canAccess) {
      if (isAccessRequested) return;
      setIsProcessingCheckout(true);
      // Simulate API call to request access
      setTimeout(() => {
        setIsAccessRequested(true);
        setIsProcessingCheckout(false);
      }, 1000);
      return;
    }
    if (onNavigateToEditor) {
      onNavigateToEditor();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-canvas-default overflow-y-auto">
      {/* Breadcrumb Top Bar */}
      <div className="px-6 py-4 border-b border-border-default bg-canvas-default sticky top-0 z-20">
        <div className="flex items-center gap-2 text-sm text-fg-muted max-w-6xl mx-auto w-full">
          <span className="text-fg-muted">Marketplace</span>
          <ChevronRight size={14} />
          <span className="text-fg-muted">{blueprint.domain}</span>
          <ChevronRight size={14} />
          <span className="text-fg-default font-medium truncate">{blueprint.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: ARCHITECTURE SPEC & PREVIEW (65%) */}
        <div className="flex-1 lg:w-[65%] flex flex-col min-w-0">
          
          {/* Canvas Preview Area */}
          <div className="w-full h-[300px] bg-canvas-inset border border-border-default rounded-lg relative overflow-hidden mb-8 flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            {/* Decorative Placeholder */}
            <div className="relative z-10 flex items-center justify-center h-full w-full opacity-30">
              <Sparkles className="w-16 h-16 text-fg-muted" />
            </div>

            <div className="absolute top-3 left-3 px-2.5 py-1 bg-canvas-surface/80 backdrop-blur-sm border border-border-default rounded text-[10px] uppercase tracking-wider font-semibold text-fg-muted flex items-center gap-1.5">
               <GitBranch size={12} />
               Interactive Preview
            </div>
          </div>

          {/* Title & Creator (Mobile mostly, or top of docs) */}
          <h1 className="text-3xl font-semibold text-fg-default tracking-tight mb-2">{blueprint.title}</h1>
          <p className="text-lg text-fg-muted mb-6">{blueprint.description}</p>

          {/* Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar border-b border-border-default mb-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'overview' ? 'border-action-accent text-fg-default' : 'border-transparent text-fg-muted hover:text-fg-default hover:border-border-default'}`}
            >
              Overview & Docs
            </button>
            <button 
              onClick={() => setActiveTab('nodes')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'nodes' ? 'border-action-accent text-fg-default' : 'border-transparent text-fg-muted hover:text-fg-default hover:border-border-default'}`}
            >
              Included Nodes ({blueprint.nodesCount})
            </button>
          </div>

          {/* Tab Content: Overview (Markdown Styled) */}
          {activeTab === 'overview' && (
            <div className="prose prose-invert prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-fg-muted">
                {blueprint.description || 'No detailed overview provided.'}
              </div>
            </div>
          )}

          {/* Tab Content: Included Nodes */}
          {activeTab === 'nodes' && (
            <div className="py-8 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-fg-default mb-4">Architecture Nodes</h2>
              
              {!canAccess ? (
                <div className="bg-canvas-surface border border-border-default rounded-lg p-12 text-center flex flex-col items-center gap-4">
                  <Lock size={32} className="text-fg-muted" />
                  <h3 className="text-lg font-medium text-fg-default">Detailed Nodes are Hidden</h3>
                  <p className="text-sm text-fg-muted max-w-md mx-auto">
                    Request free access from the owner to view the complete architectural nodes and clone this blueprint.
                  </p>
                  <button 
                    onClick={handlePurchaseOrOpen} 
                    disabled={isAccessRequested || isProcessingCheckout}
                    className="mt-2 bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingCheckout ? (
                      <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Requesting...</span>
                    ) : isAccessRequested ? (
                      'Access Requested ✓'
                    ) : (
                      'Request Free Access'
                    )}
                  </button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nodes.length > 0 ? nodes.map(node => (
                  <div key={node.id} className="bg-canvas-surface border border-border-default rounded-lg p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-canvas-inset border border-border-default">
                      {node.type === 'db' ? <DatabaseIcon /> : <Code size={16} />}
                    </div>
                    <div>                      <h4 className="font-medium text-fg-default">{node.label}</h4>                      <div className="text-xs text-fg-muted mt-1 uppercase tracking-wider mb-2">{node.type}</div>                      {node.description && <p className="text-sm text-fg-muted">{node.description}</p>}                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-fg-muted py-8 text-center border border-dashed border-border-default rounded-lg">
                    No explicit nodes recorded for this blueprint yet.
                  </div>
                )}
              </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: COMMERCE PANEL (35%) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          
          {/* Purchase Card */}
          <div className="bg-canvas-surface border border-border-default rounded-lg p-6 sticky top-[88px]">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-2">Commercial License</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-fg-default">{isFree ? 'Free' : `$${blueprint.price}`}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button 
                onClick={handlePurchaseOrOpen}
                disabled={!canAccess && (isAccessRequested || isProcessingCheckout)}
                className={`w-full text-white px-4 py-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm ${canAccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-action-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'}`}
              >
                {canAccess ? (
                  <>
                    🚀 Open in Flowchart Editor
                  </>
                ) : isProcessingCheckout ? (
                  <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
                ) : isAccessRequested ? (
                  'Access Requested ✓'
                ) : (
                  'Request Free Access'
                )}
              </button>
            </div>

            <div className="space-y-3 text-sm text-fg-muted pt-2">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-action-primary shrink-0 mt-0.5" />
                <span>Includes <strong>{blueprint.nodesCount} Editable Nodes</strong> across architectural phases</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-action-primary shrink-0 mt-0.5" />
                <span>Instant interactive flowcharts and architecture diagrams</span>
              </div>
            </div>
          </div>

          {/* Tech Stack & Metadata Card */}
          <div className="bg-canvas-surface border border-border-default rounded-lg p-6">
            <h3 className="text-sm font-semibold text-fg-default uppercase tracking-wider mb-4 border-b border-border-default pb-2">Metadata</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-t border-border-default">
                <span className="text-fg-muted">License</span>
                <span className="font-medium text-fg-default flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> {isFree ? 'Open Source' : 'Commercial'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border-default">
                <span className="text-fg-muted">Creator</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-canvas-inset border border-border-default flex items-center justify-center text-[10px] font-bold text-fg-muted">                    {blueprint.creator?.name?.charAt(0).toUpperCase() || '?'}                  </div>                  <span className="font-medium text-action-accent hover:underline">{blueprint.creator?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  );
}
