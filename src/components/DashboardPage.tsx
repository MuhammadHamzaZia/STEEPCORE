import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  BrainCircuit, 
  Package, 
  Sparkles, 
  PenTool, 
  Settings,
  GitMerge,
  Clock,
  Play,
  Loader2
} from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint } from '../types/schema';
import { useUIStore } from '../store/useUIStore';

interface DashboardPageProps {
  onNavigateToEditor?: () => void;
  onNavigateToCatalog?: () => void;
}

type TabId = 'overview' | 'roadmaps' | 'saved' | 'created' | 'settings';

export function DashboardPage({ onNavigateToEditor, onNavigateToCatalog }: DashboardPageProps) {
  const { savedBlueprintIds, activeRoadmaps } = useLibraryStore();
  const { setSelectedBlueprintId } = useUIStore();
  
  const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    const fetchSavedData = async () => {
      setIsLoading(true);
      try {
        const allBlueprints = await api.getBlueprints();
        const saved = allBlueprints.filter(bp => savedBlueprintIds.includes(bp.id));
        setSavedBlueprints(saved);
      } catch (error) {
        console.error("Failed to fetch saved blueprints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedData();
  }, [savedBlueprintIds]);

  const handleOpenBlueprint = (id: string) => {
    setSelectedBlueprintId(id);
    if (onNavigateToEditor) onNavigateToEditor();
  };

  const activeRoadmapsList = Object.entries(activeRoadmaps).map(([id, state]) => ({
    id,
    ...state
  }));
  
  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: <BarChart2 size={16} /> },
    { id: 'roadmaps', label: 'Active Roadmaps', icon: <BrainCircuit size={16} />, count: activeRoadmapsList.length },
    { id: 'saved', label: 'Saved Blueprints', icon: <Package size={16} />, count: savedBlueprints.length },
    { id: 'created', label: 'My Created Patterns', icon: <PenTool size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="flex-1 w-full flex overflow-hidden h-[calc(100vh-56px)] relative">
      {/* Sidebar Nav (Desktop only) */}
      <aside className="hidden md:flex flex-col shrink-0 border-r border-border-default bg-canvas-default w-[clamp(200px,16vw,260px)]">
         <nav className="p-4 space-y-1">
           {TABS.slice(0, 4).map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm ${activeTab === tab.id ? 'bg-canvas-inset border border-border-default text-fg-default font-medium' : 'bg-transparent border border-transparent hover:bg-canvas-inset text-fg-muted hover:text-fg-default font-medium'}`}
             >
                <div className="flex items-center gap-3">
                  {React.cloneElement(tab.icon as React.ReactElement, { className: activeTab === tab.id && tab.id === 'overview' ? 'text-action-accent' : '' })}
                  {tab.label}
                </div>
                {tab.count !== undefined && (
                  <span className="text-[10px] bg-canvas-inset border border-border-default px-1.5 py-0.5 rounded text-fg-muted">{tab.count}</span>
                )}
             </button>
           ))}
         </nav>
         <div className="mt-auto p-4 border-t border-border-default">
           <button 
             onClick={() => setActiveTab('settings')}
             className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${activeTab === 'settings' ? 'bg-canvas-inset border border-border-default text-fg-default font-medium' : 'bg-transparent border border-transparent hover:bg-canvas-inset text-fg-muted hover:text-fg-default font-medium'}`}
           >
             <Settings size={16} />
             Settings
           </button>
         </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 bg-canvas-default overflow-y-auto custom-scrollbar flex flex-col">
        {/* Mobile Tabs */}
        <div className="flex md:hidden overflow-x-auto gap-2 p-4 border-b border-border-default custom-scrollbar shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition-colors ${activeTab === tab.id ? 'bg-canvas-inset border border-border-default text-fg-default font-medium' : 'bg-transparent border border-transparent text-fg-muted hover:text-fg-default hover:bg-canvas-inset'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] bg-canvas-inset border border-border-default px-1.5 py-0.5 rounded text-fg-muted">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">          
          <h1 className="text-2xl font-semibold text-fg-default mb-6 sm:mb-8 tracking-tight">
            {activeTab === 'overview' && 'My Workspace'}
            {activeTab === 'roadmaps' && 'Active Roadmaps'}
            {activeTab === 'saved' && 'Saved Blueprints'}
            {activeTab === 'created' && 'My Created Patterns'}
            {activeTab === 'settings' && 'Settings'}
          </h1>

          {/* Top Section: In-Progress Learning Roadmaps */}
          {(activeTab === 'overview' || activeTab === 'roadmaps') && (
            <section className="mb-10 sm:mb-12">
              <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">In-Progress Learning Roadmaps</h2>
              
              {activeRoadmapsList.length === 0 ? (
                <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
                  <BrainCircuit className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-fg-default mb-2">No active roadmaps found</h3>
                  <p className="text-sm text-fg-muted mb-6">Explore the catalog or use our AI Generator to launch your first interactive study path!</p>
                  <button 
                    onClick={onNavigateToCatalog}
                    className="bg-action-primary hover:bg-action-primary-hover text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-4 sm:gap-6">
                  {activeRoadmapsList.map((roadmap) => {
                    const blueprint = savedBlueprints.find(bp => bp.id === roadmap.id);
                    const title = blueprint?.title || "Custom Roadmap";
                    
                    return (
                      <div key={roadmap.id} className="bg-canvas-surface border border-border-default rounded-lg p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-action-primary group-hover:w-2 transition-all"></div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-fg-default truncate" title={title}>{title}</h3>
                            <span className="text-sm font-semibold text-action-primary shrink-0">{roadmap.progress}%</span>
                          </div>
                          
                          {/* Visual Progress Bar */}
                          <div className="w-full h-2 bg-canvas-inset rounded-full overflow-hidden border border-border-default mb-3">
                            <div className="h-full bg-action-primary rounded-full relative transition-all duration-500 ease-out" style={{ width: `${roadmap.progress}%` }}>
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[progress_1s_linear_infinite]"></div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-fg-muted">
                            <span className="font-medium text-fg-default truncate max-w-[200px]">Next: {roadmap.completedNodes.length > 0 ? "Continue Progress" : "Start First Node"}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{roadmap.completedNodes.length} Nodes Completed</span>
                          </div>
                        </div>
                        <div className="shrink-0 mt-2 sm:mt-0">
                          <button 
                            onClick={() => handleOpenBlueprint(roadmap.id)}
                            className="w-full bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] shadow-sm"
                          >
                            <Play size={14} className="fill-white" />
                            Continue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Bottom Section: Saved Architecture Blueprints */}
          {(activeTab === 'overview' || activeTab === 'saved') && (
            <section>
              <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">Saved Architecture Blueprints</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-action-accent" />
                </div>
              ) : savedBlueprints.length === 0 ? (
                <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
                  <GitMerge className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-fg-default mb-2">Your library is empty</h3>
                  <p className="text-sm text-fg-muted mb-6">Browse the catalog to find and save blueprints to your workspace.</p>
                  <button 
                    onClick={onNavigateToCatalog}
                    className="bg-canvas-inset hover:bg-canvas-surface border border-border-default text-fg-default px-5 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Go to Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6 w-full pb-20 md:pb-6">
                  {savedBlueprints.map(bp => (
                    <div key={bp.id} className="@container bg-canvas-surface border border-border-default rounded-lg overflow-hidden hover:border-fg-muted transition-colors flex flex-col group relative">
                      <div className="h-32 bg-canvas-inset border-b border-border-default relative overflow-hidden flex items-center justify-center p-4">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                        <GitMerge size={48} className="text-fg-muted opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-wrap items-center gap-4 opacity-40">
                            <div className="w-8 h-6 bg-border-default rounded-sm border border-fg-muted"></div>
                            <div className="w-4 h-0.5 bg-border-default"></div>
                            <div className="flex flex-col gap-2">
                              <div className="w-8 h-6 bg-border-default rounded-sm border border-fg-muted"></div>
                              <div className="w-8 h-6 bg-border-default rounded-sm border border-fg-muted"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-fg-default text-[clamp(0.875rem,1.5cqi,1.125rem)] mb-2 group-hover:text-action-accent transition-colors line-clamp-2">{bp.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-fg-muted mb-4 mt-auto">
                          <Clock size={12} />
                          <span>Saved recently</span>
                        </div>
                        <button 
                          onClick={() => handleOpenBlueprint(bp.id)}
                          className="w-full bg-canvas-inset hover:bg-canvas-surface border border-border-default text-fg-default px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          Open in Editor <span className="text-action-accent">🚀</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {(activeTab === 'created' || activeTab === 'settings') && (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
              <PenTool className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-fg-default mb-2">Coming Soon</h3>
              <p className="text-sm text-fg-muted">This section is under construction.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
