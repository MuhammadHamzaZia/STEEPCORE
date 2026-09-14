import { create } from 'zustand';

type PriceFilter = 'all' | 'free' | 'paid';
type AssetTypeFilter = 'all' | 'blueprint' | 'roadmap';
type SortBy = 'popular' | 'price-asc' | 'price-desc';

interface UIStore {
  searchQuery: string;
  selectedDomain: string;
  selectedCategoryType: string;
  selectedIndustry: string;
  priceFilter: PriceFilter;
  assetTypeFilter: AssetTypeFilter;
  sortBy: SortBy;
  activeTab: string;
  selectedBlueprintId: string | null;
  selectedPromptType: string;
  setSearchQuery: (query: string) => void;
  setSelectedDomain: (domain: string) => void;
  setSelectedCategoryType: (type: string) => void;
  setSelectedIndustry: (industry: string) => void;
  setPriceFilter: (filter: PriceFilter) => void;
  setAssetTypeFilter: (filter: AssetTypeFilter) => void;
  setSortBy: (sort: SortBy) => void;
  setActiveTab: (tab: string) => void;
  setSelectedBlueprintId: (id: string | null) => void;
  setSelectedPromptType: (type: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: '',
  selectedDomain: 'all',
  selectedCategoryType: 'all',
  selectedIndustry: 'all',
  priceFilter: 'all',
  assetTypeFilter: 'all',
  sortBy: 'popular',
  activeTab: 'overview',
  selectedBlueprintId: null,
  selectedPromptType: 'System Architecture',
  isAuthModalOpen: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  setSelectedCategoryType: (type) => set({ selectedCategoryType: type }),
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
  setPriceFilter: (filter) => set({ priceFilter: filter }),
  setAssetTypeFilter: (filter) => set({ assetTypeFilter: filter }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedBlueprintId: (id) => set({ selectedBlueprintId: id }),
  setSelectedPromptType: (type) => set({ selectedPromptType: type }),
  setIsAuthModalOpen: (val) => set({ isAuthModalOpen: val })
}));
