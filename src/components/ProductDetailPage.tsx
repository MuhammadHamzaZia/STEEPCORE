import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink, Sparkles, Check, Star, ShieldCheck, Download, Code, GitBranch, Loader2 } from 'lucide-react';
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
  const isFree = blueprint.isFree;
  const canAccess = isOwned || isFree;

  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const handlePurchaseOrOpen = async () => {
    if (!canAccess) {
      setIsProcessingCheckout(true);
      try {
        const session = await api.createCheckoutSession(blueprint.id);
        if (session && session.checkoutUrl) {
          window.location.href = session.checkoutUrl;
          return;
        }
      } catch (err) {
        console.warn("API checkout session call:", err);
      } finally {
        setIsProcessingCheckout(false);
      }
      markNodeCompleted(blueprint.id, 'init', blueprint.nodesCount);
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
          <a href="#" className="hover:text-action-accent transition-colors">Marketplace</a>
          <ChevronRight size={14} />
          <a href="#" className="hover:text-action-accent transition-colors">{blueprint.domain}</a>
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
            
            {/* Mock Graph Preview */}
            <div className="relative z-10 w-full max-w-md mx-auto p-4 flex flex-col items-center gap-6 opacity-60">
              <div className="flex items-center gap-8 w-full justify-center">
                <div className="px-4 py-2 bg-canvas-surface border border-border-default rounded-md text-xs font-mono text-fg-muted shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fg-muted"></span> Client
                </div>
                <div className="h-0.5 w-12 bg-border-default relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-border-default rotate-45"></div>
                </div>
                <div className="px-4 py-2 bg-canvas-surface border border-action-accent rounded-md text-xs font-mono text-action-accent shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-action-accent"></span> API Gateway
                </div>
                <div className="h-0.5 w-12 bg-border-default relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-border-default rotate-45"></div>
                </div>
                <div className="px-4 py-2 bg-canvas-surface border border-purple-500/50 rounded-md text-xs font-mono text-purple-400 shadow-sm flex items-center gap-2">
                  <DatabaseIcon /> VectorDB
                </div>
              </div>
              <div className="w-0.5 h-8 bg-border-default relative mr-[140px]">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 border-border-default rotate-45"></div>
              </div>
              <div className="px-4 py-2 bg-canvas-surface border border-action-primary/50 rounded-md text-xs font-mono text-action-primary shadow-sm flex items-center gap-2 mr-[140px]">
                <Sparkles size={12} /> LLM Orchestrator
              </div>
            </div>

            <div className="absolute top-3 left-3 px-2.5 py-1 bg-canvas-surface/80 backdrop-blur-sm border border-border-default rounded text-[10px] uppercase tracking-wider font-semibold text-fg-muted flex items-center gap-1.5">
               <GitBranch size={12} />
               Interactive Preview
            </div>
            <button className="absolute bottom-3 right-3 p-2 bg-canvas-surface border border-border-default rounded-md text-fg-muted hover:text-fg-default hover:border-fg-muted transition-colors shadow-sm">
               <ExternalLink size={16} />
            </button>
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
            <button 
              onClick={() => setActiveTab('prereqs')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'prereqs' ? 'border-action-accent text-fg-default' : 'border-transparent text-fg-muted hover:text-fg-default hover:border-border-default'}`}
            >
              Prerequisites
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-action-accent text-fg-default' : 'border-transparent text-fg-muted hover:text-fg-default hover:border-border-default'}`}
            >
              Reviews ({blueprint.starsCount})
            </button>
          </div>

          {/* Tab Content: Overview (Markdown Styled) */}
          {activeTab === 'overview' && (
            <div className="prose prose-invert prose-slate max-w-none prose-h2:text-fg-default prose-h2:text-xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-border-default prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4 prose-p:text-fg-muted prose-p:leading-relaxed prose-a:text-action-accent prose-code:text-fg-default prose-code:bg-canvas-inset prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-canvas-inset prose-pre:border prose-pre:border-border-default">
              <h2>System Architecture Overview</h2>
              <p>
                Retrieval-Augmented Generation (RAG) is the industry standard for grounding Large Language Models in private or proprietary data. This blueprint covers a production-ready setup utilizing FastAPI for the serving layer, pgvector for high-performance vector retrieval, and a modular LLM orchestrator (LangChain/LlamaIndex agnostic).
              </p>
              
              <h2>Data Ingestion Flow</h2>
              <p>
                The ingestion pipeline is decoupled from the serving API. It utilizes asynchronous task queues (Celery/Redis) to chunk documents, generate embeddings via <code>text-embedding-3-small</code>, and upsert them into PostgreSQL.
              </p>

              <h2>Sample Implementation</h2>
              <p>Below is a snippet included in the blueprint for configuring the pgvector connection securely:</p>
              <pre>
                <code>{`import os
from sqlalchemy import create_engine
from pgvector.sqlalchemy import Vector

# Establish connection using secure credentials
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)

def init_db():
    with engine.connect() as conn:
        conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
        conn.commit()`}</code>
              </pre>

              <h2>Scalability Considerations</h2>
              <ul>
                <li><strong>Stateless API:</strong> The FastAPI layer is completely stateless, allowing horizontal scaling behind a standard load balancer.</li>
                <li><strong>Connection Pooling:</strong> PgBouncer is highly recommended when scaling beyond 50 concurrent API instances.</li>
                <li><strong>Caching:</strong> Redis is used to cache frequent semantic search queries with an exact-match threshold.</li>
              </ul>
            </div>
          )}

          {/* Tab Content: Included Nodes */}
          {activeTab === 'nodes' && (
            <div className="py-8 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-fg-default mb-4">Architecture Nodes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nodes.length > 0 ? nodes.map(node => (
                  <div key={node.id} className="bg-canvas-surface border border-border-default rounded-lg p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-canvas-inset border border-border-default">
                      {node.type === 'db' ? <DatabaseIcon /> : <Code size={16} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-fg-default">{node.label}</h4>
                      <div className="text-xs text-fg-muted mt-1 uppercase tracking-wider">{node.type}</div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-fg-muted py-8 text-center border border-dashed border-border-default rounded-lg">
                    No explicit nodes recorded for this blueprint yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Prerequisites */}
          {activeTab === 'prereqs' && (
            <div className="py-8 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-fg-default mb-4">Required Prerequisites</h2>
              <div className="bg-canvas-surface border border-border-default rounded-lg p-6">
                <ul className="space-y-4 text-fg-muted">
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-action-accent mt-0.5 shrink-0" />
                    <span>Basic understanding of Python and asynchronous programming.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-action-accent mt-0.5 shrink-0" />
                    <span>Familiarity with containerization (Docker, docker-compose).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-action-accent mt-0.5 shrink-0" />
                    <span>Understanding of vector embeddings and cosine similarity.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content: Reviews */}
          {activeTab === 'reviews' && (
            <div className="py-8 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-fg-default">User Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold text-fg-default">{blueprint.rating.toFixed(1)}</span>
                  <span className="text-fg-muted">({blueprint.starsCount} reviews)</span>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="bg-canvas-surface border border-border-default rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-canvas-inset border border-border-default flex items-center justify-center text-xs font-bold text-fg-muted">U{i+1}</div>
                      <div>
                        <div className="text-sm font-medium text-fg-default">User_{Math.floor(Math.random() * 1000)}</div>
                        <div className="text-xs text-fg-muted">2 weeks ago</div>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={14} className={j < Math.floor(blueprint.rating) ? "text-yellow-500 fill-yellow-500" : "text-fg-muted"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-fg-muted">This blueprint saved my team weeks of architectural planning. The FastAPI boilerplate is excellent and the pgvector setup is highly optimized.</p>
                  </div>
                ))}
              </div>
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
                className={`w-full text-white px-4 py-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm ${canAccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-action-primary hover:bg-action-primary-hover'}`}
              >
                {canAccess ? (
                  <>
                    🚀 Open in Flowchart Editor
                  </>
                ) : (
                  <>
                    Buy & Clone Blueprint - ${blueprint.price}
                  </>
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
                <span>Lifetime Updates & Export (JSON/PNG)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-action-primary shrink-0 mt-0.5" />
                <span>Direct Q&A access to blueprint creator</span>
              </div>
            </div>
          </div>

          {/* Tech Stack & Metadata Card */}
          <div className="bg-canvas-surface border border-border-default rounded-lg p-6">
            <h3 className="text-sm font-semibold text-fg-default uppercase tracking-wider mb-4 border-b border-border-default pb-2">Tech Stack & Metadata</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-fg-muted mb-2">Core Technologies</span>
                <div className="flex flex-wrap gap-2">
                  {blueprint.techStack.map(tech => (
                    <span key={tech} className="px-2.5 py-1 rounded bg-canvas-inset border border-border-default text-fg-default font-mono text-xs">{tech}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-border-default">
                <span className="text-fg-muted">License</span>
                <span className="font-medium text-fg-default flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> {isFree ? 'Open Source' : 'Commercial'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border-default">
                <span className="text-fg-muted">Creator</span>
                <div className="flex items-center gap-2">
                  <img src={blueprint.creator.avatar} alt={blueprint.creator.name} className="w-5 h-5 rounded-full border border-border-default" />
                  <a href="#" className="font-medium text-action-accent hover:underline">{blueprint.creator.name}</a>
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
