import React from 'react';
import { Home, Compass, Sparkles, BookOpen, Bookmark, PenTool, Settings, Plus, Lock } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  onNavigate: (page: 'landing' | 'catalog' | 'roadmap' | 'product' | 'editor' | 'dashboard') => void;
  currentPage: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage }) => {
  const { savedBlueprintIds, activeRoadmaps } = useLibraryStore();
  const { selectedDomain, setSelectedDomain, setSelectedIndustry, setSelectedCategoryType, setIsAuthModalOpen, setActiveTab } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const activeCount = isAuthenticated ? Object.keys(activeRoadmaps).length : 0;
  const savedCount = isAuthenticated ? savedBlueprintIds.length : 0;

  const quickLinks = [
    { type: 'cat', id: 'Role-Based', label: 'Role-Based Paths' },
    { type: 'cat', id: 'Skill-Based', label: 'Skill-Based Guides' },
    { type: 'ind', id: 'Construction', label: 'Construction & Eng' },
    { type: 'ind', id: 'Automotive', label: 'Automotive & Auto' },
  ];

  
  const handleQuickLink = (type: string, id: string) => {
    setSelectedDomain('all');
    setSelectedCategoryType('all');
    setSelectedIndustry('all');
    
    if (type === 'cat') setSelectedCategoryType(id);
    if (type === 'ind') setSelectedIndustry(id);
    
    onNavigate('catalog');
  };

  return (
    <aside className="flex w-[260px] h-full bg-[#0d1117] border-r border-[#30363d] flex-col text-[#e6edf3] shrink-0 z-10">
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Nav */}
        <div className="space-y-1 mb-8">
          <button 
            onClick={() => onNavigate('landing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'landing' ? 'bg-[#161b22] text-[#e6edf3]' : 'text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]'}`}
          >
            <Home size={16} className={currentPage === 'landing' ? 'text-[#e6edf3]' : 'text-[#7d8590]'} />
            Home / Landing
          </button>
          <button 
            onClick={() => onNavigate('catalog')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'catalog' ? 'bg-[#161b22] text-[#e6edf3]' : 'text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]'}`}
          >
            <Compass size={16} className={currentPage === 'catalog' ? 'text-[#e6edf3]' : 'text-[#7d8590]'} />
            Explore Catalog
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                const input = document.querySelector('input[type="text"]');
                if (input instanceof HTMLElement) input.focus();
              }, 100);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
          >
            <Sparkles size={16} className="text-[#7d8590]" />
            AI Roadmap Builder
          </button>
        </div>

        {/* Workspace */}
        <div className="mb-8">
          <div className="px-3 text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>My Workspace</span>
            {!isAuthenticated && <Lock size={11} className="text-[#7d8590] opacity-60" />}
          </div>
          <div className="space-y-1">
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setActiveTab('roadmaps');
                onNavigate('dashboard');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={16} />
                Active Learning Paths
              </div>
              {isAuthenticated && activeCount > 0 && (
                <span className="bg-[#21262d] text-xs py-0.5 px-2 rounded-full text-emerald-400 font-semibold">{activeCount}</span>
              )}
            </button>
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setActiveTab('saved');
                onNavigate('dashboard');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
            >
              <div className="flex items-center gap-3">
                <Bookmark size={16} />
                Saved Blueprints
              </div>
              {isAuthenticated && savedCount > 0 && (
                <span className="bg-[#21262d] text-xs py-0.5 px-2 rounded-full text-blue-400 font-semibold">{savedCount}</span>
              )}
            </button>
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setActiveTab('created');
                onNavigate('dashboard');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
            >
              <div className="flex items-center gap-3">
                <PenTool size={16} />
                My Published Patterns
              </div>
            </button>
          </div>
        </div>

        {/* Domain Filter */}
        <div className="mb-8">
          <div className="px-3 text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wider">Quick Filters</div>
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => handleQuickLink(link.type, link.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30363d]"></div>
                  {link.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#30363d] space-y-2">
        <button 
          onClick={() => onNavigate('editor')}
          className="w-full flex items-center justify-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create / Sell Pattern
        </button>
      </div>
    </aside>
  );
};
