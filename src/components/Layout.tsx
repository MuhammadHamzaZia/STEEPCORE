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
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#238636] text-white flex items-center justify-center font-bold text-[10px]">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                )}
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
              className="flex items-center gap-2 bg-canvas-inset border border-border-default hover:bg-canvas-surface text-fg-default px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In</span>
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

