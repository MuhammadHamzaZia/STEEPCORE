import React from 'react';
import { Home, Compass, Sparkles, BookOpen, Bookmark, PenTool, Settings, Plus } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useUIStore } from '../../store/useUIStore';

interface SidebarProps {
  onNavigate: (page: 'landing' | 'catalog' | 'roadmap' | 'product' | 'editor' | 'dashboard') => void;
  currentPage: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage }) => {
  const { savedBlueprintIds, activeRoadmaps } = useLibraryStore();
  const { selectedDomain, setSelectedDomain } = useUIStore();

  const domains = [
    { id: 'all', label: 'All Domains' },
    { id: 'Web Architecture', label: 'Web Architecture' },
    { id: 'AI/ML', label: 'AI & ML Systems' },
    { id: 'DevOps', label: 'Cloud & DevOps' },
  ];

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    onNavigate('catalog');
  };

  return (
    <aside className="w-[260px] h-full bg-[#0d1117] border-r border-[#30363d] flex flex-col text-[#e6edf3] shrink-0">
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
          <div className="px-3 text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wider">My Workspace</div>
          <div className="space-y-1">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={16} />
                Active Learning Paths
              </div>
              {Object.keys(activeRoadmaps).length > 0 && (
                <span className="bg-[#21262d] text-xs py-0.5 px-2 rounded-full">{Object.keys(activeRoadmaps).length}</span>
              )}
            </button>
            <button 
              onClick={() => {
                onNavigate('catalog');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
            >
              <div className="flex items-center gap-3">
                <Bookmark size={16} />
                Saved Blueprints
              </div>
              {savedBlueprintIds.length > 0 && (
                <span className="bg-[#21262d] text-xs py-0.5 px-2 rounded-full">{savedBlueprintIds.length}</span>
              )}
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
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
          <div className="px-3 text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wider">Domain Filter</div>
          <div className="space-y-1">
            {domains.map(domain => (
              <label 
                key={domain.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3] cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedDomain === domain.id ? 'border-[#388bfd]' : 'border-[#30363d]'}`}>
                  {selectedDomain === domain.id && <div className="w-2 h-2 rounded-full bg-[#388bfd]" />}
                </div>
                <input 
                  type="radio" 
                  name="domain" 
                  className="hidden" 
                  checked={selectedDomain === domain.id}
                  onChange={() => handleDomainSelect(domain.id)}
                />
                <span className={selectedDomain === domain.id ? 'text-[#e6edf3]' : ''}>{domain.label}</span>
              </label>
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
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]">
          <Settings size={16} />
          System Settings
        </button>
      </div>
    </aside>
  );
};
