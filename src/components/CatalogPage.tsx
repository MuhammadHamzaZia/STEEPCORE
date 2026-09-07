import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Star, GitMerge, Search, Filter, Bookmark, Loader2, Sparkles, Check } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint } from '../types/schema';

interface BlueprintCardProps {
  id: string;
  username: string;
  repo: string;
  title: string;
  tags: string[];
  nodesCount: number;
  rating: number;
  reviews: number;
  price: number;
  isFree: boolean;
  originType?: 'official' | 'creator' | 'ai_generated' | 'remixed';
  onClick?: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({ id, username, repo, title, tags, nodesCount, rating, reviews, price, isFree, originType, onClick, isBookmarked, onToggleBookmark }) => (
  <div onClick={onClick} className="@container bg-canvas-surface border border-border-default rounded-lg overflow-hidden hover:border-fg-muted transition-colors flex flex-col group cursor-pointer relative z-0">
    
    {originType === 'official' ? (
      <div className="absolute top-3 left-3 bg-[#1f6feb]/10 border border-[#388bfd]/30 text-[#2f81f7] text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 z-10 shadow-sm backdrop-blur-sm">
        ⚡ Official
      </div>
    ) : originType === 'creator' ? (
      <div className="absolute top-3 left-3 bg-canvas-inset/80 backdrop-blur-sm border border-border-default text-fg-muted text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 z-10 shadow-sm">
        👤 @{username}
      </div>
    ) : null}

    <button onClick={onToggleBookmark} className="absolute top-3 right-3 p-1.5 rounded-md bg-canvas-default border border-border-default hover:border-fg-muted transition-colors z-10">
      <Bookmark size={16} className={isBookmarked ? "text-action-accent fill-action-accent" : "text-fg-muted"} />
    </button>
    <div className="h-36 bg-canvas-inset border-b border-border-default relative overflow-hidden flex items-center justify-center p-4">
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
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="text-xs text-fg-muted font-mono mb-1 truncate w-full max-w-full">{username}/{repo}</div>
      <h3 className="font-semibold text-fg-default text-[clamp(0.875rem,1.5cqi,1.125rem)] mb-3 group-hover:text-action-accent transition-colors line-clamp-2">{title}</h3>
      
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags?.slice(0, 3).map((tag, index) => (
          <span key={tag} className={`px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-inset border border-border-default text-fg-muted ${index === 2 ? 'hidden @[300px]:inline-block' : ''}`}>{tag}</span>
        ))}
      </div>

      <div className="text-xs text-fg-muted mb-4 mt-auto">
        {nodesCount} Nodes
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border-default">
        <div className="flex items-center gap-1.5 text-xs text-fg-muted">
          <Star size={14} className="text-yellow-500 fill-yellow-500/20" />
          <span>{rating?.toFixed(1) || '0.0'}</span>
          <span className="hidden @[300px]:inline">({reviews || 0})</span>
        </div>
        {isFree ? (
          <div className="text-sm font-semibold text-action-primary bg-action-primary/10 px-2 py-0.5 rounded border border-action-primary/20">Free</div>
        ) : (
          <div className="text-sm font-semibold text-fg-default bg-canvas-inset px-2 py-0.5 rounded border border-border-default">${price}</div>
        )}
      </div>
    </div>
  </div>
);

interface CatalogPageProps {
  onNavigateToProduct?: () => void;
  onNavigateToRoadmap?: () => void;
}

export function CatalogPage({ onNavigateToProduct, onNavigateToRoadmap }: CatalogPageProps) {
  const { 
    searchQuery, setSearchQuery, 
    selectedDomain, setSelectedDomain, 
    priceFilter, setPriceFilter, 
    assetTypeFilter, setAssetTypeFilter,
    sortBy, setSortBy,
    setSelectedBlueprintId 
  } = useUIStore();
  
  const { savedBlueprintIds, toggleBookmark } = useLibraryStore();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchBlueprints = async () => {
      setIsLoading(true);
      try {
        const data = await api.getBlueprints();
        setBlueprints(data);
      } catch (error) {
        console.error('Failed to fetch blueprints', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlueprints();
  }, []);

  const filteredBlueprints = blueprints.filter(bp => {
    const q = searchQuery?.toLowerCase() || '';
    const matchesSearch = !q || 
                          bp.title?.toLowerCase().includes(q) || 
                          bp.description?.toLowerCase().includes(q) ||
                          bp.techStack?.some(t => t?.toLowerCase().includes(q));
                          
    const matchesDomain = selectedDomain === 'all' || bp.domain === selectedDomain;
    
    const matchesPrice = priceFilter === 'all' || 
                         (priceFilter === 'free' && bp.isFree) || 
                         (priceFilter === 'paid' && !bp.isFree);
                         
    // Simulated asset type logic based on data flags or keywords
    const matchesAssetType = assetTypeFilter === 'all' || 
                             (assetTypeFilter === 'roadmap' && bp.title?.toLowerCase().includes('roadmap')) ||
                             (assetTypeFilter === 'blueprint' && !bp.title?.toLowerCase().includes('roadmap'));

    return matchesSearch && matchesDomain && matchesPrice && matchesAssetType;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    // popular (default)
    return b.starsCount - a.starsCount;
  });

  const domains = [
    { name: 'all', label: 'All Domains' },
    { name: 'Web Architecture', label: 'Web Architecture' },
    { name: 'AI/ML', label: 'AI & ML Systems' },
    { name: 'DevOps', label: 'Cloud & DevOps' }
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Starred' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
  ];

  const toggleAssetType = (type: 'blueprint' | 'roadmap') => {
    if (assetTypeFilter === type) {
      setAssetTypeFilter('all');
    } else {
      setAssetTypeFilter(type);
    }
  };

  return (
    <div className="flex-1 w-full flex overflow-hidden h-[calc(100vh-56px)] relative">
      
      {/* Mobile Filter Button */}
      <button 
        onClick={() => setIsMobileFiltersOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#238636] hover:bg-[#2ea043] border border-[rgba(255,255,255,0.1)] shadow-lg text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
      >
        <Filter size={14} />
        Filters
      </button>

      {/* Left Sidebar (Taxonomy Drawer) */}
      <>
        {isMobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)}></div>
        )}
        <aside className={`fixed md:relative inset-x-0 bottom-0 top-1/4 md:inset-auto z-50 transform ${isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'} md:translate-y-0 transition-transform duration-300 md:flex flex-col shrink-0 md:border-r border-t md:border-t-0 border-border-default bg-canvas-default w-full md:w-[clamp(220px,18vw,300px)] rounded-t-2xl md:rounded-none overflow-y-auto custom-scrollbar`}>
          <div className="p-4 border-b border-border-default flex items-center justify-between md:block">
            <h2 className="text-sm font-semibold text-fg-default">Filters</h2>
            <button className="md:hidden text-fg-muted hover:text-fg-default transition-colors p-1" onClick={() => setIsMobileFiltersOpen(false)}>✕</button>
          </div>

          {/* Domain Section */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center justify-between mb-3 cursor-pointer group">
            <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Domain</h3>
            <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
          </div>
          <ul className="space-y-2 text-sm text-fg-muted">
            {domains.map((d) => (
              <li 
                key={d.name}
                onClick={() => setSelectedDomain(d.name)}
                className={`flex items-center justify-between cursor-pointer transition-colors ${selectedDomain === d.name ? 'text-fg-default font-medium' : 'hover:text-fg-default'}`}
              >
                <span>{d.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Asset Type Section */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center justify-between mb-3 cursor-pointer group">
            <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Asset Type</h3>
            <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
          </div>
          <div className="space-y-2.5 text-sm text-fg-default">
            <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => toggleAssetType('blueprint')}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${assetTypeFilter === 'blueprint' || assetTypeFilter === 'all' ? 'bg-action-primary border-action-primary' : 'bg-[#161b22] border-[#30363d]'}`}>
                {(assetTypeFilter === 'blueprint' || assetTypeFilter === 'all') && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className="group-hover:text-action-accent transition-colors text-fg-muted">System Blueprints</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => toggleAssetType('roadmap')}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${assetTypeFilter === 'roadmap' || assetTypeFilter === 'all' ? 'bg-action-primary border-action-primary' : 'bg-[#161b22] border-[#30363d]'}`}>
                {(assetTypeFilter === 'roadmap' || assetTypeFilter === 'all') && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className="group-hover:text-action-accent transition-colors text-fg-muted">Skill Roadmaps</span>
            </label>
          </div>
        </div>

        {/* Price & License Section */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center justify-between mb-3 cursor-pointer group">
            <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Price & License</h3>
            <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
          </div>
          <div className="space-y-2.5 text-sm text-fg-default">
            <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setPriceFilter(priceFilter === 'free' ? 'all' : 'free')}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${priceFilter === 'free' ? 'bg-action-primary border-action-primary' : 'bg-[#161b22] border-[#30363d] group-hover:border-fg-muted'}`}>
                {priceFilter === 'free' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className="group-hover:text-action-accent transition-colors text-fg-muted">Free / Open Source</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setPriceFilter(priceFilter === 'paid' ? 'all' : 'paid')}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${priceFilter === 'paid' ? 'bg-action-primary border-action-primary' : 'bg-[#161b22] border-[#30363d] group-hover:border-fg-muted'}`}>
                {priceFilter === 'paid' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className="group-hover:text-action-accent transition-colors text-fg-muted">Paid ($1 - $50+)</span>
            </label>
          </div>
        </div>
      </aside>
      </>

      {/* Main Content Canvas */}
      <main className="flex-1 bg-canvas-default overflow-y-auto custom-scrollbar flex flex-col">
        {/* Top Header & Breadcrumbs */}
        <div className="px-4 sm:px-6 py-4 border-b border-border-default bg-canvas-default sticky top-0 z-30">
          <div className="flex flex-wrap items-center justify-between gap-4 gap-y-3">
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-sm text-fg-muted mb-1">
                <a href="#" className="hover:text-action-accent transition-colors">Marketplace</a>
                <ChevronRight size={14} />
                <span className="text-fg-default font-medium">
                  {selectedDomain === 'all' ? 'All Domains' : domains.find(d => d.name === selectedDomain)?.label}
                </span>
              </div>
              <p className="text-xs text-fg-muted">Showing {filteredBlueprints.length} results</p>
            </div>
            
            {/* Filter Toolbar */}
            <div className="flex flex-1 flex-wrap items-center sm:justify-end gap-3 min-w-[300px]">
              <div className="relative flex-1 min-w-[160px] max-w-[480px] transition-all">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blueprints..." 
                  className="bg-canvas-inset border border-border-default rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent text-fg-default placeholder:text-fg-muted w-full"
                />
              </div>
              
              <div className="relative shrink-0 whitespace-nowrap">
                <button 
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 bg-canvas-inset border border-border-default hover:bg-canvas-surface text-fg-default px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Filter size={14} className="text-fg-muted" />
                  <span>Sort: {sortOptions.find(o => o.id === sortBy)?.label}</span>
                  <ChevronDown size={14} className="text-fg-muted ml-1" />
                </button>
                
                {isSortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-canvas-surface border border-border-default rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      {sortOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortBy(option.id as any);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option.id ? 'bg-canvas-inset text-fg-default font-medium' : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="p-6">
          {isLoading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-action-accent" />
             </div>
          ) : filteredBlueprints.length === 0 ? (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-12 max-w-md mx-auto text-center mt-12">
               <Sparkles className="w-10 h-10 text-action-accent mx-auto mb-4 opacity-80" />
               <h3 className="text-lg font-semibold text-fg-default mb-2 tracking-tight">No blueprints found matching your criteria</h3>
               <p className="text-sm text-fg-muted mb-6">We don't have a pre-built pattern for this yet in our catalog.</p>
               <button 
                onClick={() => {
                  if (onNavigateToRoadmap) onNavigateToRoadmap();
                  // Fallback if not provided is just handled by root app via prompt trigger
                }}
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors border border-[rgba(255,255,255,0.1)] shadow-sm inline-flex items-center gap-2"
               >
                 <Sparkles size={16} />
                 Use AI to Generate This Now
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6 w-full pb-20 md:pb-6">
              {filteredBlueprints.map(bp => (
                <BlueprintCard 
                  key={bp.id}
                  id={bp.id}
                  username={bp.creator?.name?.replace('@', '') || 'unknown'}
                  repo={bp.slug}
                  title={bp.title}
                  tags={bp.techStack}
                  nodesCount={bp.nodesCount}
                  rating={bp.rating}
                  reviews={bp.starsCount}
                  price={bp.price}
                  isFree={bp.isFree}
                  originType={bp.source}
                  onClick={() => {
                    setSelectedBlueprintId(bp.id);
                    if (onNavigateToProduct) onNavigateToProduct();
                  }}
                  isBookmarked={savedBlueprintIds.includes(bp.id)}
                  onToggleBookmark={(e) => {
                    e.stopPropagation();
                    toggleBookmark(bp.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
