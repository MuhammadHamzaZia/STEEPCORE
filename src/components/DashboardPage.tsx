import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  BrainCircuit, 
  Package, 
  Sparkles, 
  PenTool, 
  GitMerge, 
  Clock, 
  Play, 
  User, 
  Activity,
  Lock,
  RotateCcw,
  LogIn
} from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint } from '../types/schema';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';

interface DashboardPageProps {
  onNavigateToEditor?: () => void;
  onNavigateToCatalog?: () => void;
}

type TabId = 'overview' | 'roadmaps' | 'saved' | 'created' | 'profile';

export function DashboardPage({ onNavigateToEditor, onNavigateToCatalog }: DashboardPageProps) {
  const { savedBlueprintIds, activeRoadmaps, syncFromDatabase, resetProgress } = useLibraryStore();
  const { user, isAuthenticated } = useAuthStore();
  const { setSelectedBlueprintId, activeTab: globalActiveTab, setActiveTab: setGlobalActiveTab, setIsAuthModalOpen } = useUIStore();
  
  const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);
  const [myBlueprints, setMyBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const activeTab = (globalActiveTab as TabId) || 'overview';
  const setActiveTab = setGlobalActiveTab;

  useEffect(() => {
    // If not authenticated, do not fetch private data or show progress
    if (!isAuthenticated) {
      setSavedBlueprints([]);
      setMyBlueprints([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Sync latest progress from database
        await syncFromDatabase();

        const allBlueprints = await api.getBlueprints();
        if (isMounted) {
          const saved = allBlueprints.filter(bp => savedBlueprintIds.includes(bp.id));
          setSavedBlueprints(saved);
        }
        
        try {
          const my = await api.getMyBlueprints();
          if (isMounted) {
            setMyBlueprints(my);
          }
        } catch {
          // Ignore if user has no blueprints or backend 404
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchUserData();
    return () => { isMounted = false; };
  }, [isAuthenticated, savedBlueprintIds.length]);

  const handleOpenBlueprint = (id: string) => {
    setSelectedBlueprintId(id);
    if (onNavigateToEditor) onNavigateToEditor();
  };

  const handleResetProgress = async (e: React.MouseEvent, blueprintId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to reset your learning progress for this roadmap? This will clear all completed checkpoints from the database.")) {
      return;
    }
    setResettingId(blueprintId);
    try {
      await resetProgress(blueprintId);
    } finally {
      setResettingId(null);
    }
  };

  // Only expose active roadmaps if user is signed in
  const activeRoadmapsList = isAuthenticated 
    ? Object.entries(activeRoadmaps).map(([id, state]) => ({ id, ...state }))
    : [];
  
  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: <BarChart2 size={16} /> },
    { id: 'roadmaps', label: 'Active Roadmaps', icon: <BrainCircuit size={16} />, count: isAuthenticated ? activeRoadmapsList.length : undefined },
    { id: 'saved', label: 'Saved Blueprints', icon: <Package size={16} />, count: isAuthenticated ? savedBlueprints.length : undefined },
    { id: 'created', label: 'My Created Patterns', icon: <PenTool size={16} />, count: isAuthenticated && myBlueprints.length > 0 ? myBlueprints.length : undefined },
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
  ];

  return (
    <div className="flex-1 w-full flex overflow-hidden h-[calc(100vh-56px)] relative">
      {/* Sidebar Nav (Desktop only) */}
      <aside className="hidden md:flex flex-col shrink-0 border-r border-border-default bg-canvas-default w-[clamp(200px,16vw,260px)]">
         <nav className="p-4 space-y-1">
           {TABS.map(tab => (
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
                  <span className="text-[10px] bg-canvas-inset border border-border-default px-1.5 py-0.5 rounded text-fg-muted font-mono">{tab.count}</span>
                )}
             </button>
           ))}
         </nav>
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
                <span className="text-[10px] bg-canvas-inset border border-border-default px-1.5 py-0.5 rounded text-fg-muted font-mono">{tab.count}</span>
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
            {activeTab === 'profile' && 'User Profile'}
          </h1>

          {/* If unauthenticated: Stop all activities and show authenticated access requirement */}
          {!isAuthenticated ? (
            <div className="bg-canvas-surface border border-border-default rounded-xl p-8 sm:p-12 text-center shadow-md max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-action-primary/10 border border-action-primary/20 text-action-primary flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Lock size={26} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-fg-default mb-2 tracking-tight">
                Sign In Required
              </h2>
              <p className="text-sm text-fg-muted max-w-md mx-auto mb-6 leading-relaxed">
                Your learning progress, completed checkpoints, and saved blueprints are tied to your STEEPCORE user account and synced with the database. Sign in or register to view and continue your progress.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto bg-action-primary hover:bg-action-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  Sign In / Create Account
                </button>
                <button
                  onClick={onNavigateToCatalog}
                  className="w-full sm:w-auto bg-canvas-inset border border-border-default hover:bg-canvas-surface text-fg-default px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Browse Public Catalog
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Authenticated Top Section: In-Progress Learning Roadmaps */}
              {(activeTab === 'overview' || activeTab === 'roadmaps') && (
                <section className="mb-10 sm:mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">In-Progress Learning Roadmaps</h2>
                    <span className="text-xs text-fg-muted">Synced with STEEPCORE API</span>
                  </div>
                  
                  {activeRoadmapsList.length === 0 ? (
                    <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
                      <BrainCircuit className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-fg-default mb-2">No active roadmaps in progress</h3>
                      <p className="text-sm text-fg-muted mb-6">Explore the catalog or start a roadmap to begin tracking your checkpoints.</p>
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
                        const isResetting = resettingId === roadmap.id;
                        
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
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <button 
                                onClick={() => handleOpenBlueprint(roadmap.id)}
                                className="flex-1 bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] shadow-sm"
                              >
                                <Play size={14} className="fill-white" />
                                Continue
                              </button>
                              <button
                                onClick={(e) => handleResetProgress(e, roadmap.id)}
                                disabled={isResetting}
                                title="Reset roadmap progress in database"
                                className="p-2 rounded-md bg-canvas-inset hover:bg-canvas-surface border border-border-default text-fg-muted hover:text-red-400 transition-colors"
                              >
                                <RotateCcw size={15} className={isResetting ? 'animate-spin' : ''} />
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
                      <img src="/loader.svg" alt="Loading" className="w-8 h-8 animate-spin text-action-accent object-contain" />
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
                            <h3 className="font-semibold text-fg-default text-[clamp(0.875rem,1.5cqi,1.125rem)] mb-1 group-hover:text-action-accent transition-colors line-clamp-1">{bp.title}</h3>
                            {bp.description && <p className="text-xs text-fg-muted line-clamp-2 mb-3 leading-relaxed">{bp.description}</p>}
                            <div className="flex items-center gap-1.5 text-xs text-fg-muted mb-4 mt-auto">
                              <Clock size={12} />
                              <span>Saved in Library</span>
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

              {/* My Created Patterns */}
              {activeTab === 'created' && (
                <section className="mb-10 sm:mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">My Created Roadmaps</h2>
                    <button 
                      onClick={onNavigateToEditor}
                      className="bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Create New
                    </button>
                  </div>
                  {myBlueprints.length === 0 ? (
                    <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
                      <PenTool className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-fg-default mb-2">You haven't created any roadmaps yet</h3>
                      <p className="text-sm text-fg-muted mb-6">Use the AI generator or build one from scratch in the Editor.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {myBlueprints.map((bp) => (
                        <div 
                          key={bp.id}
                          className="bg-canvas-surface border border-border-default rounded-lg p-5 shadow-sm hover:border-action-primary transition-all duration-200 cursor-pointer flex flex-col"
                          onClick={() => handleOpenBlueprint(bp.id)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="inline-block px-2 py-1 bg-canvas-inset border border-border-default rounded-sm text-xs font-medium text-fg-muted uppercase tracking-wider mb-2">
                                {bp.domain || 'Technology'}
                              </span>
                              <h3 className="text-base font-semibold text-fg-default leading-tight">{bp.title}</h3>
                            </div>
                          </div>
                          <p className="text-sm text-fg-muted line-clamp-2 mb-4 flex-1">{bp.description}</p>
                          <div className="flex items-center gap-4 text-xs font-medium text-fg-muted border-t border-border-default pt-3">
                            <span className="flex items-center gap-1.5"><BrainCircuit size={14} /> {bp.nodesCount || 0} Nodes</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* User Profile Section */}
              {activeTab === 'profile' && (
                <section className="mb-12 max-w-4xl mx-auto">
                  <div className="bg-canvas-surface border border-border-default rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm mb-8">
                    <div className="w-24 h-24 rounded-full bg-[#238636] text-white flex items-center justify-center font-bold text-4xl shrink-0 border-4 border-canvas-default shadow-md">
                      {user?.username ? user.username[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-fg-default mb-1">{user?.username || 'User Profile'}</h2>
                      <p className="text-fg-muted mb-6">{user?.email}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div 
                          onClick={() => setActiveTab('roadmaps')}
                          className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start cursor-pointer hover:border-action-primary/50 transition-colors group"
                        >
                          <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5 group-hover:text-action-primary transition-colors"><BrainCircuit size={14} className="text-action-accent" /> Active Roadmaps</div>
                          <div className="text-2xl font-bold text-fg-default">{activeRoadmapsList.length}</div>
                        </div>
                        <div className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start">
                          <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> Total Progress</div>
                          <div className="text-2xl font-bold text-emerald-500">
                            {activeRoadmapsList.length > 0 
                              ? Math.round(activeRoadmapsList.reduce((acc, curr) => acc + curr.progress, 0) / activeRoadmapsList.length) 
                              : 0}%
                          </div>
                        </div>
                        <div 
                          onClick={() => setActiveTab('saved')}
                          className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start cursor-pointer hover:border-blue-400/50 transition-colors group"
                        >
                          <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors"><Package size={14} className="text-blue-400" /> Saved Items</div>
                          <div className="text-2xl font-bold text-fg-default">{savedBlueprints.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-fg-default mb-4 flex items-center gap-2"><Activity size={18} className="text-action-primary" /> Active Progress Tracking</h3>
                    {activeRoadmapsList.length === 0 ? (
                      <div className="bg-canvas-surface border border-border-default rounded-lg p-10 text-center shadow-sm">
                        <BrainCircuit className="w-10 h-10 text-fg-muted mx-auto mb-3 opacity-50" />
                        <p className="text-fg-muted mb-4">You haven't started tracking any roadmaps yet.</p>
                        <button 
                          onClick={() => setActiveTab('roadmaps')}
                          className="bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Find a Roadmap
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeRoadmapsList.map(roadmap => {
                          const blueprint = savedBlueprints.find(bp => bp.id === roadmap.id);
                          const title = blueprint?.title || "Custom Roadmap";
                          return (
                            <div key={roadmap.id} className="bg-canvas-surface border border-border-default rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-action-primary/50 transition-colors cursor-pointer shadow-sm group" onClick={() => handleOpenBlueprint(roadmap.id)}>
                              <div className="flex-1 w-full">
                                <h4 className="font-semibold text-fg-default mb-2 group-hover:text-action-primary transition-colors">{title}</h4>
                                <div className="w-full max-w-lg h-2 bg-canvas-inset rounded-full overflow-hidden border border-border-default">
                                  <div className="h-full bg-action-primary rounded-full relative transition-all duration-500" style={{ width: `${roadmap.progress}%` }}>
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[progress_1s_linear_infinite]"></div>
                                  </div>
                                </div>
                                <div className="text-xs text-fg-muted mt-2">{roadmap.completedNodes.length} steps completed</div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0 sm:self-center self-end">
                                <div className="flex flex-col items-end">
                                  <span className="text-lg font-bold text-fg-default">{roadmap.progress}%</span>
                                  <span className="text-xs text-fg-muted">completed</span>
                                </div>
                                <button className="text-white bg-action-primary hover:bg-action-primary-hover px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                                  <Play size={14} className="fill-white" />
                                  Resume
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
