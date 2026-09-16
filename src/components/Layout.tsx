import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, User, Terminal, LogOut, Activity, Key } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { Sidebar } from './layout/Sidebar';
import { AuthModal } from './AuthModal';
import { api } from '../services/api';

type Page = 'landing' | 'catalog' | 'roadmap' | 'product' | 'editor' | 'dashboard';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

export function Layout({ children, currentPage = 'landing', onNavigate }: LayoutProps) {
  const { searchQuery, setSearchQuery, isAuthModalOpen, setIsAuthModalOpen } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      const res = await api.checkHealth();
      if (isMounted) {
        setApiHealth(res.status === 'offline' ? 'offline' : 'online');
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-canvas-default text-fg-default font-sans">
      
      {/* Header */}
      <header className="h-14 bg-canvas-inset border-b border-border-default flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            > 
              <img src="/logo.svg" alt="Steepcore Logo" className="w-8 h-8 object-contain" />
            </div>
            <span 
              className="font-bold text-fg-default tracking-tight cursor-pointer ml-2 text-lg"
              onClick={() => onNavigate && onNavigate('landing')}
            >
              STEEPCORE
            </span>
          </div>


        </div>

        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input 
              type="text" 
              placeholder="Search your library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onNavigate) {
                  onNavigate('catalog');
                }
              }}
              className="w-full bg-canvas-inset border border-border-default rounded-md py-1.5 pl-9 pr-8 text-sm focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent transition-colors text-fg-default"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded border border-border-default bg-canvas-default text-fg-muted text-xs font-mono">
              /
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium mr-2">
            <button 
              onClick={() => onNavigate && onNavigate('catalog')}
              className="text-fg-muted hover:text-fg-default transition-colors"
            >
              Explore
            </button>
            <button 
              onClick={() => { if(onNavigate){ useUIStore.getState().setActiveTab('saved'); onNavigate('dashboard'); } }}
              className="text-fg-muted hover:text-fg-default transition-colors"
            >
              My Library
            </button>
          </div>

          <button 
            onClick={() => onNavigate && onNavigate('editor')}
            className="hidden sm:flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[rgba(255,255,255,0.1)] whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Create Blueprint</span>
          </button>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 border border-border-default bg-canvas-inset hover:bg-canvas-surface text-fg-default px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#238636] text-white flex items-center justify-center font-bold text-[10px]">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[90px] truncate hidden sm:inline">{user.username}</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl z-50 py-2 text-sm">
                    <div 
                      className="px-4 py-3 border-b border-[#30363d] text-xs cursor-pointer hover:bg-[#010409] transition-colors"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onNavigate) {
                          onNavigate('dashboard');
                          useUIStore.getState().setActiveTab('profile');
                        }
                      }}
                    >
                      <p className="font-semibold text-[#e6edf3] truncate">{user.username}</p>
                      <p className="text-[#7d8590] truncate">{user.email}</p>
                      <div className="mt-2 text-action-primary font-medium flex items-center gap-1">View Profile & Progress <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onNavigate) {
                          onNavigate('dashboard');
                          // Need a way to set active tab, maybe via useUIStore
                          useUIStore.getState().setActiveTab('roadmaps');
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-[#c9d1d9] hover:bg-[#010409] flex items-center gap-2 text-xs transition-colors"
                    >
                      <Activity size={14} /> My Active Roadmaps
                    </button>
                    <button 
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-[#010409] flex items-center gap-2 text-xs transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 bg-canvas-inset border border-border-default hover:bg-canvas-surface text-fg-default px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <Key size={14} className="text-action-accent" />
              <span>Sign In / API Auth</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {onNavigate && isSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto">
              <Sidebar onNavigate={(page) => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
                onNavigate(page);
              }} currentPage={currentPage} />
            </div>
          </>
        )}

        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

    </div>
  );
}

