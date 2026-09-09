import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles, Globe, Cloud, BrainCircuit, Database, Star, GitMerge, Loader2 } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint } from '../types/schema';

interface LandingPageProps {
  onGeneratePrompt: (prompt: string, promptType: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToProduct?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGeneratePrompt, onNavigateToCatalog, onNavigateToProduct }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedPromptType, setSelectedPromptType] = useState('System Architecture');
  const { setSelectedDomain, setSelectedBlueprintId } = useUIStore();
  const { savedBlueprintIds, toggleBookmark } = useLibraryStore();
  const [trendingBlueprints, setTrendingBlueprints] = useState<Blueprint[]>([]);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const [domainCounts, setDomainCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  const openModal = (title: string, body: string) => {
    setModalContent({ title, body });
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trending, suggestions, counts] = await Promise.all([
          api.getTrendingBlueprints(3),
          api.getQuickSuggestions(),
          api.getDomainCounts()
        ]);
        setTrendingBlueprints(trending);
        setQuickSuggestions(suggestions);
        setDomainCounts(counts);
      } catch (error) {
        console.error('Failed to fetch landing page data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onGeneratePrompt(inputValue.trim(), selectedPromptType);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onGeneratePrompt(suggestion, selectedPromptType);
  };

  const handleDomainClick = (domain: string) => {
    setSelectedDomain(domain);
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center pt-16 pb-12 px-4 sm:px-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl mb-10 flex flex-col items-center">
        <h1 className="text-3xl font-semibold text-fg-default mb-4 tracking-tight">
          System Architecture & Skill Blueprints
        </h1>
        <p className="text-lg text-fg-muted max-w-2xl mx-auto">
          Production-ready flowcharts, learning roadmaps, and AI-generated systems.
        </p>
      </div>

      {/* AI Prompt Workspace Box */}
      <div className="w-full max-w-[800px] mb-6">
        <form onSubmit={handleSubmit} className="bg-canvas-surface border border-border-default rounded-lg overflow-hidden flex flex-col focus-within:border-action-accent focus-within:ring-1 focus-within:ring-action-accent transition-all">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe a system architecture or learning roadmap you want to build..."
            className="w-full bg-transparent border-none p-4 text-fg-default placeholder:text-fg-muted resize-none focus:outline-none focus:ring-0 min-h-[120px] text-sm"
          />
          
          {/* Bottom toolbar */}
          <div className="bg-canvas-inset border-t border-border-default px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
              <button 
                type="button" 
                onClick={() => setSelectedPromptType('System Architecture')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border whitespace-nowrap ${
                  selectedPromptType === 'System Architecture' 
                    ? 'bg-action-primary/10 border-action-primary/30 text-action-primary' 
                    : 'text-fg-muted hover:text-fg-default hover:bg-canvas-surface border-transparent'
                }`}
              >
                <Sparkles size={14} className={selectedPromptType === 'System Architecture' ? "text-action-primary" : "text-action-accent"} />
                <span>System Architecture</span>
                <ChevronDown size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedPromptType('Learning Roadmap')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border whitespace-nowrap ${
                  selectedPromptType === 'Learning Roadmap' 
                    ? 'bg-[#8957e5]/10 border-[#8957e5]/30 text-[#8957e5]' 
                    : 'text-fg-muted hover:text-fg-default hover:bg-canvas-surface border-transparent'
                }`}
              >
                <BrainCircuit size={14} className={selectedPromptType === 'Learning Roadmap' ? "text-[#8957e5]" : "text-purple-400"} />
                <span>Learning Roadmap</span>
                <ChevronDown size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedPromptType('Database')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border whitespace-nowrap ${
                  selectedPromptType === 'Database' 
                    ? 'bg-[#238636]/10 border-[#238636]/30 text-[#238636]' 
                    : 'text-fg-muted hover:text-fg-default hover:bg-canvas-surface border-transparent'
                }`}
              >
                <Database size={14} className={selectedPromptType === 'Database' ? "text-[#238636]" : "text-emerald-400"} />
                <span>Database</span>
                <ChevronDown size={14} />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-full sm:w-auto bg-action-primary hover:bg-action-primary-hover text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] whitespace-nowrap"
            >
              Generate 🚀
            </button>
          </div>
        </form>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex overflow-x-auto items-center gap-2 mb-16 max-w-3xl w-full px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {quickSuggestions.map(suggestion => {
          const s = suggestion.toLowerCase();
          let emoji = '✨';
          if (s.includes('go') || s.includes('microservice')) emoji = '📦';
          else if (s.includes('ai') || s.includes('llm') || s.includes('ml') || s.includes('rag')) emoji = '🤖';
          else if (s.includes('rust')) emoji = '🦀';
          else if (s.includes('event') || s.includes('arch')) emoji = '⚡';
          else if (s.includes('database') || s.includes('sql') || s.includes('data')) emoji = '🗄️';
          else if (s.includes('web') || s.includes('react') || s.includes('node') || s.includes('frontend')) emoji = '🌐';
          else if (s.includes('cloud') || s.includes('devops') || s.includes('docker') || s.includes('aws')) emoji = '☁️';
          else {
            const fallbackEmojis = ['✨', '🚀', '💡', '🔥', '🧩', '🛠️', '📈'];
            emoji = fallbackEmojis[suggestion.length % fallbackEmojis.length];
          }

          return (
            <button 
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)} 
              className="px-3 py-1.5 rounded-full border border-border-default bg-canvas-surface text-fg-muted hover:text-fg-default hover:border-fg-muted transition-colors text-xs flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <span>{emoji}</span>
              <span>{suggestion}</span>
            </button>
          );
        })}
        {quickSuggestions.length === 0 && (
          <div className="text-sm text-fg-muted w-full text-center">Loading suggestions...</div>
        )}
      </div>

      {/* DOMAINS & CATEGORIES */}
      <div className="w-full max-w-[1000px] mb-16">
        <h2 className="text-sm font-semibold text-fg-default mb-4 uppercase tracking-wider">Domains & Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onClick={() => handleDomainClick('Web Architecture')} className="bg-canvas-surface border border-border-default rounded-lg p-5 flex items-start gap-4 hover:border-action-accent transition-colors cursor-pointer group">
            <div className="p-2.5 rounded-md bg-canvas-inset border border-border-default group-hover:border-action-accent/30 transition-colors">
              <Globe size={20} className="text-fg-default" />
            </div>
            <div>
              <h3 className="font-semibold text-fg-default text-base">Web Architecture</h3>
              <p className="text-sm text-fg-muted mt-1">{domainCounts['Web Architecture'] || 0} Patterns</p>
            </div>
          </div>
          
          <div onClick={() => handleDomainClick('AI/ML')} className="bg-canvas-surface border border-border-default rounded-lg p-5 flex items-start gap-4 hover:border-action-accent transition-colors cursor-pointer group">
            <div className="p-2.5 rounded-md bg-canvas-inset border border-border-default group-hover:border-action-accent/30 transition-colors">
              <BrainCircuit size={20} className="text-fg-default" />
            </div>
            <div>
              <h3 className="font-semibold text-fg-default text-base">AI & ML Systems</h3>
              <p className="text-sm text-fg-muted mt-1">{domainCounts['AI/ML'] || 0} Roadmaps</p>
            </div>
          </div>
          
          <div onClick={() => handleDomainClick('DevOps')} className="bg-canvas-surface border border-border-default rounded-lg p-5 flex items-start gap-4 hover:border-action-accent transition-colors cursor-pointer group">
            <div className="p-2.5 rounded-md bg-canvas-inset border border-border-default group-hover:border-action-accent/30 transition-colors">
              <Cloud size={20} className="text-fg-default" />
            </div>
            <div>
              <h3 className="font-semibold text-fg-default text-base">Cloud & DevOps</h3>
              <p className="text-sm text-fg-muted mt-1">{domainCounts['DevOps'] || 0} Blueprints</p>
            </div>
          </div>
        </div>
      </div>

      {/* TRENDING BLUEPRINTS */}
      <div className="w-full max-w-[1000px] mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-fg-default uppercase tracking-wider">Trending Blueprints</h2>
          <button 
            onClick={onNavigateToCatalog}
            className="text-sm text-action-accent hover:underline flex items-center gap-1"
          >
            See all
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-action-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingBlueprints.map(bp => (
              <div key={bp.id} onClick={() => { setSelectedBlueprintId(bp.id); if (onNavigateToProduct) onNavigateToProduct(); }} className="bg-canvas-surface border border-border-default rounded-lg overflow-hidden hover:border-fg-muted transition-colors flex flex-col group cursor-pointer">
                <div className="h-32 bg-canvas-inset border-b border-border-default relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                  <GitMerge size={48} className="text-fg-muted opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-4 opacity-40">
                      <div className="w-8 h-6 bg-border-default rounded-sm border border-fg-muted"></div>
                      <div className="w-4 h-0.5 bg-border-default"></div>
                      <div className="flex flex-col gap-2">
                        <div className="w-8 h-6 bg-border-default rounded-sm border border-fg-muted"></div>
                        <div className="w-8 h-6 bg-border-default rounded-sm border border-fg-muted"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    {bp.source === 'official' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#1f6feb]/10 border border-[#388bfd]/30 text-[#2f81f7]">
                        ⚡ Official
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-canvas-inset border border-border-default text-fg-muted">
                        👤 @{bp?.creator?.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(bp.id);
                      }}
                      className="p-1.5 rounded-md bg-canvas-surface/80 backdrop-blur-sm border border-border-default text-fg-muted hover:text-yellow-500 hover:border-yellow-500/50 transition-colors shadow-sm"
                    >
                      <Star size={14} className={savedBlueprintIds.includes(bp.id) ? "fill-yellow-500 text-yellow-500" : ""} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-fg-muted font-mono mb-1">{bp?.creator?.name}/{bp.slug}</div>
                  <h3 className="font-semibold text-fg-default text-base mb-3 group-hover:text-action-accent transition-colors">{bp.title}</h3>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {(bp.techStack || []).slice(0, 3).map(tech => (
                      <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-inset border border-border-default text-fg-muted">{tech}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-default">
                    <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                      <Star size={14} className="text-yellow-500 fill-yellow-500/20" />
                      <span>{(bp.rating || 0).toFixed(1)}</span>
                      <span>({bp.starsCount})</span>
                    </div>
                    {bp.isFree ? (
                      <div className="text-sm font-semibold text-action-primary bg-action-primary/10 px-2 py-0.5 rounded border border-action-primary/20">Free</div>
                    ) : (
                      <div className="text-sm font-semibold text-fg-default bg-canvas-inset px-2 py-0.5 rounded border border-border-default">${bp.price}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-auto pt-12 pb-4 text-sm text-fg-muted border-t border-border-default w-full max-w-[1000px] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <span>© {new Date().getFullYear()} STEEPCORE, Inc.</span>
        <div className="flex gap-4">
          <button 
            onClick={() => openModal('Terms of Service', 'These are the official terms of service for STEEPCORE. Please use our community responsibly.')} 
            className="hover:text-action-accent transition-colors"
          >
            Terms
          </button>
          <button 
            onClick={() => openModal('Privacy Policy', 'We value your privacy. Your data is encrypted and never sold to third parties.')} 
            className="hover:text-action-accent transition-colors"
          >
            Privacy
          </button>
          <button 
            onClick={() => openModal('Documentation', 'Welcome to the STEEPCORE Docs. Here you will find guides on system architecture, database design, and learning roadmaps.')} 
            className="hover:text-action-accent transition-colors"
          >
            Docs
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-canvas-default border border-border-default rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-canvas-subtle">
              <h3 className="font-semibold text-fg-default">{modalContent.title}</h3>
              <button onClick={() => setModalOpen(false)} className="text-fg-muted hover:text-fg-default">
                ✕
              </button>
            </div>
            <div className="p-4 text-sm text-fg-muted leading-relaxed">
              {modalContent.body}
            </div>
            <div className="px-4 py-3 border-t border-border-default bg-canvas-subtle flex justify-end">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 bg-canvas-inset border border-border-default hover:bg-canvas-surface rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


