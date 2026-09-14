import { create } from 'zustand';

type PriceFilter = 'all' | 'free' | 'paid';
type AssetTypeFilter = 'all' | 'blueprint' | 'roadmap';
type SortBy = 'popular' | 'price-asc' | 'price-desc';

interface UIStore {
  searchQuery: string;
  selectedDomain: string[];
  selectedCategoryType: string[];
  selectedIndustry: string[];
  priceFilter: PriceFilter;
  assetTypeFilter: AssetTypeFilter;
  sortBy: SortBy;
  activeTab: string;
  selectedBlueprintId: string | null;
  selectedPromptType: string;
  setSearchQuery: (query: string) => void;
  setSelectedDomain: (domain: string | string[]) => void;
  toggleDomain: (domain: string) => void;
  setSelectedCategoryType: (type: string | string[]) => void;
  toggleCategoryType: (type: string) => void;
  setSelectedIndustry: (industry: string | string[]) => void;
  toggleIndustry: (industry: string) => void;
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
  selectedDomain: [],
  selectedCategoryType: [],
  selectedIndustry: [],
  priceFilter: 'all',
  assetTypeFilter: 'all',
  sortBy: 'popular',
  activeTab: 'overview',
  selectedBlueprintId: null,
  selectedPromptType: 'System Architecture',
  isAuthModalOpen: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDomain: (domain) => set({ selectedDomain: Array.isArray(domain) ? domain : (domain === "all" ? [] : [domain]) }),
  toggleDomain: (domain) => set((state) => ({ selectedDomain: domain === "all" ? [] : (state.selectedDomain.includes(domain) ? state.selectedDomain.filter(d => d !== domain) : [...state.selectedDomain, domain]) })),
  setSelectedCategoryType: (type) => set({ selectedCategoryType: Array.isArray(type) ? type : (type === "all" ? [] : [type]) }),
  toggleCategoryType: (type) => set((state) => ({ selectedCategoryType: type === "all" ? [] : (state.selectedCategoryType.includes(type) ? state.selectedCategoryType.filter(d => d !== type) : [...state.selectedCategoryType, type]) })),
  setSelectedIndustry: (industry) => set({ selectedIndustry: Array.isArray(industry) ? industry : (industry === "all" ? [] : [industry]) }),
  toggleIndustry: (industry) => set((state) => ({ selectedIndustry: industry === "all" ? [] : (state.selectedIndustry.includes(industry) ? state.selectedIndustry.filter(d => d !== industry) : [...state.selectedIndustry, industry]) })),
  setPriceFilter: (filter) => set({ priceFilter: filter }),
  setAssetTypeFilter: (filter) => set({ assetTypeFilter: filter }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedBlueprintId: (id) => set({ selectedBlueprintId: id }),
  setSelectedPromptType: (type) => set({ selectedPromptType: type }),
  setIsAuthModalOpen: (val) => set({ isAuthModalOpen: val })
}));
