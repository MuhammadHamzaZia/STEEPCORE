import { create } from 'zustand';

type PriceFilter = 'all' | 'free' | 'paid';
type AssetTypeFilter = 'all' | 'blueprint' | 'roadmap';
type SortBy = 'popular' | 'rating' | 'price-asc' | 'price-desc';

interface UIStore {
  searchQuery: string;
  selectedDomain: string;
  priceFilter: PriceFilter;
  assetTypeFilter: AssetTypeFilter;
  sortBy: SortBy;
  activeTab: string;
  selectedBlueprintId: string | null;
  selectedPromptType: string;
  setSearchQuery: (query: string) => void;
  setSelectedDomain: (domain: string) => void;
  setPriceFilter: (filter: PriceFilter) => void;
  setAssetTypeFilter: (filter: AssetTypeFilter) => void;
  setSortBy: (sort: SortBy) => void;
  setActiveTab: (tab: string) => void;
  setSelectedBlueprintId: (id: string | null) => void;
  setSelectedPromptType: (type: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: '',
  selectedDomain: 'all',
  priceFilter: 'all',
  assetTypeFilter: 'all',
  sortBy: 'popular',
  activeTab: 'overview',
  selectedBlueprintId: null,
  selectedPromptType: 'System Architecture',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  setPriceFilter: (filter) => set({ priceFilter: filter }),
  setAssetTypeFilter: (filter) => set({ assetTypeFilter: filter }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedBlueprintId: (id) => set({ selectedBlueprintId: id }),
  setSelectedPromptType: (type) => set({ selectedPromptType: type })
}));
