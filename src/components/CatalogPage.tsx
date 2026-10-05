import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, Star, GitMerge, Search, Filter, Bookmark, Sparkles, Check, RefreshCw, SlidersHorizontal, ArrowUpDown, X, LayoutGrid, LayoutList, ChevronUp } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { api } from '../services/api';
import { Blueprint } from '../types/schema';

interface BlueprintCardProps {
  id: string;
  username: string;
  repo: string;
  title: string;
  description?: string;
  nodesCount: number;
  price: number;
  originType?: 'official' | 'creator' | 'ai_generated' | 'remixed';
  onCardClick?: (id: string) => void;
  isBookmarked: boolean;
  onBookmarkClick: (e: React.MouseEvent, id: string) => void;
  isCompact?: boolean;
}

const BlueprintSkeletonCard = React.memo<{ isCompact?: boolean }>(({ isCompact }) => (
  <div className="@container bg-canvas-surface border border-border-default rounded-lg overflow-hidden flex flex-col relative z-0 animate-pulse">
    <div className="absolute top-2 left-2 w-14 h-4 bg-border-default/50 rounded z-10"></div>
    <div className="absolute top-2 right-2 w-6 h-6 bg-canvas-default border border-border-default rounded-md z-10 flex items-center justify-center">
      <div className="w-3 h-3 bg-border-default/40 rounded-sm"></div>
    </div>
    
    <div className={`${isCompact ? 'h-20 sm:h-32' : 'h-24 sm:h-36'} bg-canvas-inset border-b border-border-default relative overflow-hidden flex items-center justify-center p-3`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
      <div className="w-10 h-10 rounded-lg bg-border-default/20 flex items-center justify-center">
        <GitMerge size={24} className="text-fg-muted opacity-20" />
      </div>
    </div>
    
    <div className={`${isCompact ? 'p-2.5 sm:p-3.5' : 'p-3.5 sm:p-4'} flex flex-col flex-1`}>
      <div className="w-20 h-2.5 bg-border-default/40 rounded mb-1.5"></div>
      <div className="w-4/5 h-3.5 bg-border-default/70 rounded mb-1"></div>
      <div className="w-3/5 h-3.5 bg-border-default/70 rounded mb-2.5"></div>
      
      {!isCompact && (
        <>
          <div className="w-full h-2.5 bg-border-default/30 rounded mb-1.5 hidden xs:block"></div>
          <div className="w-4/5 h-2.5 bg-border-default/30 rounded mb-3 hidden xs:block"></div>
        </>
      )}
      
      <div className="w-14 h-2.5 bg-border-default/40 rounded mb-2 mt-auto"></div>
      
      <div className="flex items-center justify-between pt-2 border-t border-border-default">
        <div className="w-9 h-3 bg-border-default/40 rounded"></div>
        <div className="w-10 h-4 bg-border-default/50 rounded"></div>
      </div>
    </div>
  </div>
));

const BlueprintCard = React.memo<BlueprintCardProps>(({ 
  id, username, repo, title, description, nodesCount, price, originType, 
  onCardClick, isBookmarked, onBookmarkClick, isCompact = false 
}) => (
  <div 
    onClick={() => onCardClick && onCardClick(id)} 
    onMouseEnter={() => {
      api.getBlueprintById(id).catch(() => {});
    }}
    className="@container bg-canvas-surface border border-border-default rounded-lg overflow-hidden hover:border-fg-muted transition-all flex flex-col group cursor-pointer relative z-0 animate-in fade-in duration-200 shadow-xs active:scale-[0.98]"
  >
    {originType === 'official' ? (
      <div className="absolute top-2 left-2 bg-[#1f6feb]/15 border border-[#388bfd]/30 text-[#2f81f7] text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 z-10 shadow-sm backdrop-blur-sm">
        ⚡ Official
      </div>
    ) : originType === 'creator' ? (
      <div className="absolute top-2 left-2 bg-canvas-inset/85 backdrop-blur-sm border border-border-default text-fg-muted text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 z-10 shadow-sm">
        👤 @{username}
      </div>
    ) : null}

    <button 
      onClick={(e) => onBookmarkClick(e, id)} 
      title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
      className="absolute top-2 right-2 p-1 sm:p-1.5 rounded-md bg-canvas-default/80 backdrop-blur-sm border border-border-default hover:border-fg-muted transition-colors z-10 active:scale-90"
    >
      <Bookmark size={13} className={isBookmarked ? "text-action-accent fill-action-accent" : "text-fg-muted"} />
    </button>

    {/* Graphical Node Map Preview Banner */}
    <div className={`${isCompact ? 'h-20 sm:h-32' : 'h-24 sm:h-36'} bg-canvas-inset border-b border-border-default relative overflow-hidden flex items-center justify-center p-2 sm:p-4 transition-all duration-300`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
      <GitMerge size={isCompact ? 26 : 32} className="text-fg-muted opacity-20 sm:w-12 sm:h-12" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-4 opacity-40">
          <div className="w-4 h-3 sm:w-8 sm:h-6 bg-border-default rounded-sm border border-fg-muted"></div>
          <div className="w-2 sm:w-4 h-0.5 bg-border-default"></div>
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="w-4 h-3 sm:w-8 sm:h-6 bg-border-default rounded-sm border border-fg-muted"></div>
            <div className="w-4 h-3 sm:w-8 sm:h-6 bg-border-default rounded-sm border border-fg-muted"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Card Content */}
    <div className={`${isCompact ? 'p-2.5 sm:p-3.5' : 'p-3 sm:p-4'} flex flex-col flex-1`}>
      <div className="text-[10px] sm:text-xs text-fg-muted font-mono mb-0.5 truncate w-full">{username}/{repo}</div>
      <h3 className={`font-semibold text-fg-default ${isCompact ? 'text-xs sm:text-sm line-clamp-2' : 'text-xs sm:text-sm md:text-base line-clamp-2'} mb-1 group-hover:text-action-accent transition-colors leading-snug`}>
        {title}
      </h3>
      
      {!isCompact && description && (
        <p className="text-[11px] sm:text-xs text-fg-muted line-clamp-2 mb-2 leading-relaxed hidden xs:block">
          {description}
        </p>
      )}

      <div className="text-[10px] sm:text-xs text-fg-muted mb-2 mt-auto flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-action-primary/70"></span>
        <span>{nodesCount} Nodes</span>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs">
        <span className="text-[10px] sm:text-xs text-fg-muted">{price === 0 ? 'Free' : 'Premium'}</span>
        {price === 0 ? (
          <div className="text-[11px] sm:text-xs font-semibold text-action-primary bg-action-primary/10 px-1.5 sm:px-2 py-0.5 rounded border border-action-primary/20">Free</div>
        ) : (
          <div className="text-[11px] sm:text-xs font-semibold text-fg-default bg-canvas-inset px-1.5 sm:px-2 py-0.5 rounded border border-border-default">${price}</div>
        )}
      </div>
    </div>
  </div>
));



function getMockCategoryType(title) {
  const t = (title || '').toLowerCase();
  if (['engineer', 'developer', 'manager', 'architect', 'analyst', 'mechanic', 'designer', 'doctor'].some(k => t.includes(k))) return 'Role-Based';
  if (['build', 'create', 'make', 'project', 'app', 'website', 'car', 'house', 'building'].some(k => t.includes(k))) return 'Project-Based';
  return 'Skill-Based';
}

function getMockIndustry(title) {
  const t = (title || '').toLowerCase();
  if (['car', 'auto', 'mechanic', 'engine'].some(k => t.includes(k))) return 'Automotive';
  if (['house', 'building', 'construction', 'civil', 'architecture'].some(k => t.includes(k))) return 'Construction';
  if (['health', 'doctor', 'nurse', 'medical'].some(k => t.includes(k))) return 'Healthcare';
  if (['business', 'finance', 'trading', 'marketing'].some(k => t.includes(k))) return 'Business';
  if (['design', 'art', 'video', 'music'].some(k => t.includes(k))) return 'Creative';
  return 'IT & Software';
}

function getMockDomain(title) {
  const t = (title || '').toLowerCase();
  if (['ai', 'data', 'ml', 'machine learning'].some(k => t.includes(k))) return 'AI & Data Science';
  if (['web', 'mobile', 'react', 'ios', 'android', 'frontend', 'backend'].some(k => t.includes(k))) return 'Web & Mobile';
  if (['cloud', 'devops', 'aws', 'docker', 'kubernetes'].some(k => t.includes(k))) return 'Cloud & DevOps';
  if (['core', 'system', 'c++', 'rust', 'go', 'java'].some(k => t.includes(k))) return 'Core Engineering';
  return 'Other';
}


interface CatalogPageProps {
  onNavigateToProduct?: () => void;
  onNavigateToRoadmap?: () => void;
}

export function CatalogPage({ onNavigateToProduct, onNavigateToRoadmap }: CatalogPageProps) {
  const PAGE_SIZE = 20;
  const { 
    searchQuery, setSearchQuery, 
    selectedCategoryType, setSelectedCategoryType, toggleCategoryType,
    selectedIndustry, setSelectedIndustry, toggleIndustry,
    selectedDomain, setSelectedDomain, toggleDomain,
    priceFilter, setPriceFilter, 
    assetTypeFilter, setAssetTypeFilter,
    sortBy, setSortBy,
    setSelectedBlueprintId,
    setIsMobileHeaderHidden 
  } = useUIStore();
  
  const { savedBlueprintIds, toggleBookmark } = useLibraryStore();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [skeletonsCount, setSkeletonsCount] = useState(PAGE_SIZE);
  const observer = useRef<IntersectionObserver | null>(null);
  const activeStreamIdRef = useRef(0);

  const [categoryTypes, setCategoryTypes] = useState<{name: string, label: string}[]>([{ name: 'all', label: 'All Categories' }]);
  const [industries, setIndustries] = useState<{name: string, label: string}[]>([{ name: 'all', label: 'All Industries' }]);
  const [domainsList, setDomainsList] = useState<{name: string, label: string}[]>([{ name: 'all', label: 'All Domains' }]);

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolledCompact, setIsScrolledCompact] = useState(false);
  const [isCompactGrid, setIsCompactGrid] = useState(false);
  const isScrolledCompactRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollAnimFrameRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef(0);
  const transitionLockRef = useRef(0);

  useEffect(() => {
    isScrolledCompactRef.current = isScrolledCompact;
  }, [isScrolledCompact]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;

    if (scrollAnimFrameRef.current !== null) return;

    scrollAnimFrameRef.current = window.requestAnimationFrame(() => {
      const now = Date.now();
      const delta = currentScrollTop - lastScrollTopRef.current;
      lastScrollTopRef.current = currentScrollTop;
      scrollAnimFrameRef.current = null;

      // Always expand immediately when user is near the very top (< 40px)
      if (currentScrollTop < 40) {
        if (isScrolledCompactRef.current) {
          setIsScrolledCompact(false);
          isScrolledCompactRef.current = false;
          transitionLockRef.current = now + 350;
          scrollAccumulatorRef.current = 0;
        }
        return;
      }

      // If we are within the CSS transition lockout period, ignore scroll fluctuations caused by reflow
      if (now < transitionLockRef.current) {
        return;
      }

      // Maintain directional scroll accumulator with reset on direction flip
      if (delta > 0) {
        // Scrolling down
        if (scrollAccumulatorRef.current < 0) {
          scrollAccumulatorRef.current = 0;
        }
        scrollAccumulatorRef.current += delta;

        // When scrolling down past 70px with sustained downward scroll (accumulated > 40px)
        if (!isScrolledCompactRef.current && currentScrollTop > 70 && scrollAccumulatorRef.current > 40) {
          setIsScrolledCompact(true);
          isScrolledCompactRef.current = true;
          transitionLockRef.current = now + 350;
          scrollAccumulatorRef.current = 0;
        }
      } else if (delta < 0) {
        // Scrolling up
        if (scrollAccumulatorRef.current > 0) {
          scrollAccumulatorRef.current = 0;
        }
        scrollAccumulatorRef.current += delta;

        // When scrolling up with deliberate upward scroll (accumulated < -45px)
        if (isScrolledCompactRef.current && scrollAccumulatorRef.current < -45) {
          setIsScrolledCompact(false);
          isScrolledCompactRef.current = false;
          transitionLockRef.current = now + 350;
          scrollAccumulatorRef.current = 0;
        }
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (scrollAnimFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsMobileHeaderHidden(isScrolledCompact);
  }, [isScrolledCompact, setIsMobileHeaderHidden]);

  useEffect(() => {
    return () => {
      setIsMobileHeaderHidden(false);
    };
  }, [setIsMobileHeaderHidden]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  useEffect(() => {
     activeStreamIdRef.current += 1;
     setPage(1);
     setBlueprints([]);
     setIsLoading(true);
     setHasMore(true);
     setSkeletonsCount(PAGE_SIZE);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const [cats, inds, doms] = await Promise.all([
          api.getCategories(),
          api.getIndustries(),
          api.getDomains()
        ]);
        setCategoryTypes(cats);
        setIndustries(inds);
        setDomainsList(doms);
      } catch (error) {
        console.error('Failed to fetch taxonomy data', error);
      }
    };
    fetchTaxonomy();
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const streamId = ++activeStreamIdRef.current;

    const fetchBlueprintsPage = async () => {
      const isFirstPage = page === 1;
      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setIsStreaming(true);
      setSkeletonsCount(PAGE_SIZE);

      try {
        let fetchedItems: Blueprint[] = [];
        const isSearch = Boolean(debouncedSearch && debouncedSearch.trim().length > 0);

        if (isSearch) {
          if (isFirstPage) {
            fetchedItems = await api.searchBlueprints(debouncedSearch.trim());
          }
          setHasMore(false);
        } else {
          const forceRefresh = refreshCount > 0 && isFirstPage;
          fetchedItems = await api.getBlueprints(page, PAGE_SIZE, undefined, forceRefresh);
          setHasMore(fetchedItems.length >= PAGE_SIZE);
        }

        if (isCancelled || activeStreamIdRef.current !== streamId) return;

        if (fetchedItems.length === 0) {
          setSkeletonsCount(0);
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsStreaming(false);
          return;
        }

        // Adjust skeleton placeholders to match the incoming items if less than PAGE_SIZE
        const targetCount = fetchedItems.length;
        setSkeletonsCount(targetCount);

        // Progressively stream/display each roadmap one by one!
        for (let i = 0; i < targetCount; i++) {
          if (isCancelled || activeStreamIdRef.current !== streamId) return;

          const bp = fetchedItems[i];
          setBlueprints(prev => {
            if (prev.some(b => b.id === bp.id)) return prev;
            return [...prev, bp];
          });
          
          setSkeletonsCount(prev => Math.max(0, prev - 1));

          if (i < targetCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 60));
          }
        }
      } catch (error) {
        console.error('Failed to fetch blueprints', error);
        setSkeletonsCount(0);
      } finally {
        if (!isCancelled && activeStreamIdRef.current === streamId) {
          setSkeletonsCount(0);
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsStreaming(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchBlueprintsPage();

    return () => {
      isCancelled = true;
    };
  }, [page, debouncedSearch, refreshCount]);

  


  
  

  const filteredBlueprints = React.useMemo(() => blueprints.filter(bp => {
    const q = searchQuery?.toLowerCase() || '';
    const matchesSearch = !q || 
                          bp.title?.toLowerCase().includes(q) || 
                          bp.description?.toLowerCase().includes(q);
                          
    const catType = getMockCategoryType(bp.title);
    const ind = getMockIndustry(bp.title);
    const dom = getMockDomain(bp.title);
    
    const matchesCatType = selectedCategoryType.length === 0 || selectedCategoryType.includes(catType);
    const matchesInd = selectedIndustry.length === 0 || selectedIndustry.includes(ind);
    const matchesDomain = selectedDomain.length === 0 || selectedDomain.includes(dom);
    
    const matchesPrice = priceFilter === 'all' || 
                         (priceFilter === 'free' && bp.price === 0) || 
                         (priceFilter === 'paid' && bp.price > 0);
                         
    const matchesAssetType = assetTypeFilter === 'all' || 
                             (assetTypeFilter === 'roadmap' && bp.title?.toLowerCase().includes('roadmap')) ||
                             (assetTypeFilter === 'blueprint' && !bp.title?.toLowerCase().includes('roadmap'));

    return matchesSearch && matchesDomain && matchesCatType && matchesInd && matchesPrice && matchesAssetType;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // popular is handled by default order
  }), [blueprints, searchQuery, selectedCategoryType, selectedIndustry, selectedDomain, priceFilter, assetTypeFilter, sortBy]);

  


  
  
  


  const lastBlueprintElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore || isStreaming || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !isLoading && !isLoadingMore && !isStreaming) {
        setPage(prev => prev + 1);
      }
    }, { rootMargin: '200px' });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, isStreaming, hasMore]);

  const sortOptions = [
    { id: 'popular', label: 'Most Recent' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
  ];

  
  const handleCardClick = React.useCallback((id: string) => {
    setSelectedBlueprintId(id);
    if (onNavigateToProduct) onNavigateToProduct();
  }, [setSelectedBlueprintId, onNavigateToProduct]);

  const handleBookmarkClick = React.useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleBookmark(id);
  }, [toggleBookmark]);


  const toggleAssetType = (type: 'blueprint' | 'roadmap') => {
    if (assetTypeFilter === type) {
      setAssetTypeFilter('all');
    } else {
      setAssetTypeFilter(type);
    }
  };

  const activeFilterCount = (selectedCategoryType.length > 0 ? selectedCategoryType.length : 0) +
    (selectedIndustry.length > 0 ? selectedIndustry.length : 0) +
    (selectedDomain.length > 0 ? selectedDomain.length : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (assetTypeFilter !== 'all' ? 1 : 0);

  return (
    <div className="flex-1 w-full flex overflow-hidden h-full relative">
      
      {/* Left Sidebar (Taxonomy Drawer) */}
      <>
        {isMobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsMobileFiltersOpen(false)}></div>
        )}
        <aside className={`fixed md:relative inset-x-0 bottom-0 top-1/4 md:inset-auto z-50 md:z-10 transform ${isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'} md:translate-y-0 transition-transform duration-300 ease-out md:flex flex-col shrink-0 md:border-r border-t md:border-t-0 border-border-default bg-canvas-default w-full md:w-[clamp(220px,18vw,300px)] rounded-t-2xl md:rounded-none overflow-hidden shadow-2xl`}>
          {/* Pull indicator for mobile */}
          <div className="w-10 h-1 bg-border-default/80 rounded-full mx-auto my-2.5 md:hidden"></div>

          <div className="h-12 px-4 border-b border-border-default flex items-center justify-between shrink-0 bg-canvas-surface">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-action-accent" />
              <h2 className="text-sm font-semibold text-fg-default">Filter Catalog</h2>
              {activeFilterCount > 0 && (
                <span className="text-[10px] bg-action-primary text-white font-bold px-1.5 py-0.2 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button 
                  onClick={() => {
                    setSelectedCategoryType([]);
                    setSelectedIndustry([]);
                    setSelectedDomain([]);
                    setPriceFilter('all');
                    setAssetTypeFilter('all');
                  }}
                  className="text-xs text-action-accent hover:underline px-1 py-0.5"
                >
                  Reset
                </button>
              )}
              <button className="md:hidden text-fg-muted hover:text-fg-default p-1.5 rounded-md hover:bg-canvas-inset transition-colors" onClick={() => setIsMobileFiltersOpen(false)}>✕</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Category Type Section */}
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between mb-3 cursor-pointer group">
              <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Category Type</h3>
              <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
            </div>
            <ul className="space-y-2 text-sm text-fg-muted">
              {categoryTypes.map((d) => {
                const isSelected = d.name === 'all' ? selectedCategoryType.length === 0 : selectedCategoryType.includes(d.name);
                return (
                <li key={d.name}>
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleCategoryType(d.name);
                    }}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`group-hover:text-fg-default transition-colors ${isSelected ? 'text-fg-default font-medium' : ''}`}>{d.label}</span>
                  </label>
                </li>
              );})}
            </ul>
          </div>

          {/* Industry Section */}
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between mb-3 cursor-pointer group">
              <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Industry</h3>
              <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
            </div>
            <ul className="space-y-2 text-sm text-fg-muted">
              {industries.map((d) => {
                const isSelected = d.name === 'all' ? selectedIndustry.length === 0 : selectedIndustry.includes(d.name);
                return (
                <li key={d.name}>
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleIndustry(d.name);
                    }}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`group-hover:text-fg-default transition-colors ${isSelected ? 'text-fg-default font-medium' : ''}`}>{d.label}</span>
                  </label>
                </li>
              );})}
            </ul>
          </div>

          {/* Domain Section */}
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between mb-3 cursor-pointer group">
              <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">IT Domain (Optional)</h3>
              <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
            </div>
            <ul className="space-y-2 text-sm text-fg-muted">
              {domainsList.map((d) => {
                const isSelected = d.name === 'all' ? selectedDomain.length === 0 : selectedDomain.includes(d.name);
                return (
                <li key={d.name}>
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDomain(d.name);
                    }}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`group-hover:text-fg-default transition-colors ${isSelected ? 'text-fg-default font-medium' : ''}`}>{d.label}</span>
                  </label>
                </li>
              );})}
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
        </div>

        {/* Mobile drawer apply footer */}
        <div className="md:hidden p-3 border-t border-border-default bg-canvas-surface shrink-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(false)}
            className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Apply Filters ({filteredBlueprints.length} roadmaps)</span>
          </button>
        </div>
      </aside>
      </>

      {/* Main Content Canvas */}
      <main onScroll={handleScroll} className="flex-1 bg-canvas-default overflow-y-auto custom-scrollbar flex flex-col">
        {/* Top Header & Search/Filter Controls with smooth scroll collapse */}
        <div className={`border-b border-border-default bg-canvas-default sticky top-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] px-3 sm:px-6 ${
          isScrolledCompact 
            ? 'py-1.5 space-y-0 shadow-sm backdrop-blur-md bg-canvas-default/95' 
            : 'py-3 space-y-2.5'
        }`}>
          {/* Top Row: Breadcrumbs & Stats - remains as the ultra-sleek sticky bar when collapsed */}
          <div 
            onClick={() => {
              if (isScrolledCompact) setIsScrolledCompact(false);
            }}
            className={`flex items-center justify-between gap-2 min-h-[28px] pl-11 sm:pl-12 md:pl-0 transition-colors ${
              isScrolledCompact ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-fg-muted truncate">
              <span className="hover:text-action-accent cursor-pointer transition-colors font-medium">Marketplace</span>
              <ChevronRight size={13} className="shrink-0" />
              <span className="text-fg-default font-semibold truncate">
                {selectedDomain.length === 0 ? 'All Domains' : selectedDomain.map(sd => domainsList.find(d => d.name === sd)?.label).join(', ')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs text-fg-muted bg-canvas-surface border border-border-default px-2 py-0.5 rounded-full shrink-0 font-mono">
                {filteredBlueprints.length} blueprints
              </span>

              {/* Quick Expand Button on Mobile when search & options are collapsed */}
              {isScrolledCompact && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsScrolledCompact(false);
                  }}
                  className="md:hidden flex items-center gap-1 text-[11px] text-action-accent bg-canvas-surface hover:bg-canvas-inset border border-border-default px-2 py-0.5 rounded-md font-medium active:scale-95 shadow-xs transition-colors"
                  title="Expand search and filter options"
                >
                  <Search size={11} />
                  <span>Filters</span>
                  <ChevronDown size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Lower Section: Searchbar, Options Row, and Category Quick Chips */}
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolledCompact 
              ? 'grid-rows-[0fr] opacity-0 pointer-events-none md:grid-rows-[1fr] md:opacity-100 md:pointer-events-auto' 
              : 'grid-rows-[1fr] opacity-100'
          }`}>
            <div className="overflow-hidden min-h-0 space-y-2.5 pt-1">
              {/* Search Row: Full width */}
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search blueprints by role, skill, or keyword..." 
                    className="bg-canvas-inset border border-border-default rounded-lg pl-8 pr-8 text-xs sm:text-sm focus:outline-none focus:border-action-accent focus:ring-1 focus:ring-action-accent text-fg-default placeholder:text-fg-muted w-full transition-all duration-200 py-2"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      title="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-default p-0.5 rounded-md"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Controls Row: Filters, Sort, Grid display toggle, Sync, and Manual collapse toggle */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-0.5">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Mobile Filter Drawer Button */}
                  <button 
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="md:hidden flex items-center gap-1.5 bg-canvas-surface hover:bg-canvas-inset border border-border-default text-fg-default px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs shrink-0 active:scale-95"
                  >
                    <SlidersHorizontal size={12} className="text-action-accent" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-action-primary text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Grid View Mode Toggle Button (Single Column vs 2-Column Compact Grid on mobile) */}
                  <button
                    type="button"
                    onClick={() => setIsCompactGrid(!isCompactGrid)}
                    title={isCompactGrid ? "Switch to single card view" : "Switch to 2-column compact grid view (display more roadmaps)"}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all shadow-xs active:scale-95 shrink-0 ${
                      isCompactGrid 
                        ? 'bg-action-primary/15 border-action-primary/40 text-action-primary font-semibold' 
                        : 'bg-canvas-surface hover:bg-canvas-inset border-border-default text-fg-default'
                    }`}
                  >
                    {isCompactGrid ? (
                      <>
                        <LayoutList size={13} className="text-action-primary" />
                        <span>List (1x)</span>
                      </>
                    ) : (
                      <>
                        <LayoutGrid size={13} className="text-action-accent" />
                        <span>Grid (2x)</span>
                      </>
                    )}
                  </button>

                  {/* Sort Dropdown */}
                  <div className="relative shrink-0">
                    <button 
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="flex items-center gap-1.5 bg-canvas-surface hover:bg-canvas-inset border border-border-default text-fg-default px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shadow-xs active:scale-95"
                    >
                      <ArrowUpDown size={12} className="text-fg-muted" />
                      <span className="hidden xs:inline">Sort:</span>
                      <span>{sortOptions.find(o => o.id === sortBy)?.label}</span>
                      <ChevronDown size={12} className="text-fg-muted ml-0.5" />
                    </button>
                    
                    {isSortDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)}></div>
                        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 bg-canvas-surface border border-border-default rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {sortOptions.map(option => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSortBy(option.id as any);
                                setIsSortDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm transition-colors ${sortBy === option.id ? 'bg-canvas-inset text-fg-default font-medium' : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sync Live Button */}
                  <button
                    onClick={() => {
                      if (isRefreshing) return;
                      setIsRefreshing(true);
                      setBlueprints([]);
                      setPage(1);
                      setHasMore(true);
                      setSkeletonsCount(PAGE_SIZE);
                      setRefreshCount(prev => prev + 1);
                    }}
                    disabled={isRefreshing}
                    title="Sync live catalog from database API"
                    className="flex items-center gap-1.5 bg-canvas-surface hover:bg-canvas-inset border border-border-default text-fg-default p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap shadow-xs shrink-0 active:scale-95"
                  >
                    <RefreshCw size={12} className={`text-fg-muted ${isRefreshing ? 'animate-spin text-action-accent' : ''}`} />
                    <span className="hidden sm:inline">Sync</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick Filter Reset if filters active */}
                  {(activeFilterCount > 0 || searchQuery) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryType([]);
                        setSelectedIndustry([]);
                        setSelectedDomain([]);
                        setPriceFilter('all');
                        setAssetTypeFilter('all');
                      }}
                      className="text-xs text-action-accent hover:underline shrink-0 px-1 font-medium"
                    >
                      Reset
                    </button>
                  )}

                  {/* Manual Compact/Expand Header Button for mobile */}
                  <button
                    type="button"
                    onClick={() => setIsScrolledCompact(!isScrolledCompact)}
                    title={isScrolledCompact ? "Expand full filters header" : "Compact filters header (more display space)"}
                    className="md:hidden p-1.5 bg-canvas-surface hover:bg-canvas-inset border border-border-default rounded-md text-fg-muted hover:text-fg-default transition-colors shadow-xs active:scale-95"
                  >
                    {isScrolledCompact ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                </div>
              </div>

              {/* Category Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
                <button
                  onClick={() => toggleAssetType('blueprint')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    assetTypeFilter === 'blueprint'
                      ? 'bg-action-primary text-white border-action-primary'
                      : 'bg-canvas-surface hover:bg-canvas-inset border-border-default text-fg-muted hover:text-fg-default'
                  }`}
                >
                  System Blueprints
                </button>
                <button
                  onClick={() => toggleAssetType('roadmap')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    assetTypeFilter === 'roadmap'
                      ? 'bg-action-primary text-white border-action-primary'
                      : 'bg-canvas-surface hover:bg-canvas-inset border-border-default text-fg-muted hover:text-fg-default'
                  }`}
                >
                  Skill Roadmaps
                </button>
                <button
                  onClick={() => setPriceFilter(priceFilter === 'free' ? 'all' : 'free')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    priceFilter === 'free'
                      ? 'bg-action-primary text-white border-action-primary'
                      : 'bg-canvas-surface hover:bg-canvas-inset border-border-default text-fg-muted hover:text-fg-default'
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPriceFilter(priceFilter === 'paid' ? 'all' : 'paid')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    priceFilter === 'paid'
                      ? 'bg-action-primary text-white border-action-primary'
                      : 'bg-canvas-surface hover:bg-canvas-inset border-border-default text-fg-muted hover:text-fg-default'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="p-3 sm:p-6">
          {filteredBlueprints.length === 0 && skeletonsCount === 0 && !isLoading && !isLoadingMore && !isStreaming && !hasMore ? (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-6 sm:p-12 max-w-md mx-auto text-center mt-6 sm:mt-12">
               <Sparkles className="w-10 h-10 text-action-accent mx-auto mb-4 opacity-80" />
               <h3 className="text-base sm:text-lg font-semibold text-fg-default mb-2 tracking-tight">No blueprints found matching your criteria</h3>
               <p className="text-xs sm:text-sm text-fg-muted mb-6">We don't have a pre-built pattern for this yet in our catalog.</p>
               <button 
                onClick={() => {
                  if (onNavigateToRoadmap) onNavigateToRoadmap();
                  // Fallback if not provided is just handled by root app via prompt trigger
                }}
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors border border-[rgba(255,255,255,0.1)] shadow-sm inline-flex items-center gap-2 active:scale-95"
               >
                 <Sparkles size={15} />
                 Use AI to Generate This Now
               </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8 w-full pb-36 sm:pb-16">
              <div className={`grid w-full ${
                isCompactGrid 
                  ? 'grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]' 
                  : 'grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-6'
              }`}>
                {filteredBlueprints.map((bp: any) => (
                  <BlueprintCard 
                    key={bp.id}
                    id={bp.id}
                    username={bp.creator?.name?.replace('@', '') || 'unknown'}
                    repo={bp.slug}
                    title={bp.title}
                    description={bp.description}
                    nodesCount={bp.nodesCount}
                    price={bp.price}
                    originType={bp.source}
                    onCardClick={handleCardClick}
                    isBookmarked={savedBlueprintIds.includes(bp.id)}
                    onBookmarkClick={handleBookmarkClick}
                    isCompact={isCompactGrid}
                  />
                ))}

                {Array.from({ length: skeletonsCount }).map((_, idx) => (
                  <BlueprintSkeletonCard key={`skeleton-${idx}`} isCompact={isCompactGrid} />
                ))}

                {hasMore && !isLoading && !isLoadingMore && !isStreaming && (
                  <div ref={lastBlueprintElementRef} className="col-span-full h-8 flex items-center justify-center opacity-0 pointer-events-none" />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Filter Button (Centered at bottom) */}
      <button 
        type="button"
        onClick={() => setIsMobileFiltersOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#238636] hover:bg-[#2ea043] border border-[rgba(255,255,255,0.2)] shadow-2xl text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer active:scale-95 transition-all select-none backdrop-blur-md"
        aria-label="Open Filters"
      >
        <Filter size={15} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-[#238636] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center leading-none">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
