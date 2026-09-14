import fs from 'fs';
let code = fs.readFileSync('src/store/useUIStore.ts', 'utf8');

code = code.replace(
  /selectedDomain: string;/g,
  'selectedDomain: string[];'
);
code = code.replace(
  /selectedCategoryType: string;/g,
  'selectedCategoryType: string[];'
);
code = code.replace(
  /selectedIndustry: string;/g,
  'selectedIndustry: string[];'
);

code = code.replace(
  /setSelectedDomain: \(domain: string\) => void;/g,
  'setSelectedDomain: (domain: string | string[]) => void;\n  toggleDomain: (domain: string) => void;'
);
code = code.replace(
  /setSelectedCategoryType: \(type: string\) => void;/g,
  'setSelectedCategoryType: (type: string | string[]) => void;\n  toggleCategoryType: (type: string) => void;'
);
code = code.replace(
  /setSelectedIndustry: \(industry: string\) => void;/g,
  'setSelectedIndustry: (industry: string | string[]) => void;\n  toggleIndustry: (industry: string) => void;'
);

code = code.replace(
  /selectedDomain: 'all',/g,
  'selectedDomain: [],'
);
code = code.replace(
  /selectedCategoryType: 'all',/g,
  'selectedCategoryType: [],'
);
code = code.replace(
  /selectedIndustry: 'all',/g,
  'selectedIndustry: [],'
);

code = code.replace(
  /setSelectedDomain: \(domain\) => set\(\{ selectedDomain: domain \}\),/,
  'setSelectedDomain: (domain) => set({ selectedDomain: Array.isArray(domain) ? domain : (domain === "all" ? [] : [domain]) }),\n  toggleDomain: (domain) => set((state) => ({ selectedDomain: domain === "all" ? [] : (state.selectedDomain.includes(domain) ? state.selectedDomain.filter(d => d !== domain) : [...state.selectedDomain, domain]) })),'
);

code = code.replace(
  /setSelectedCategoryType: \(type\) => set\(\{ selectedCategoryType: type \}\),/,
  'setSelectedCategoryType: (type) => set({ selectedCategoryType: Array.isArray(type) ? type : (type === "all" ? [] : [type]) }),\n  toggleCategoryType: (type) => set((state) => ({ selectedCategoryType: type === "all" ? [] : (state.selectedCategoryType.includes(type) ? state.selectedCategoryType.filter(d => d !== type) : [...state.selectedCategoryType, type]) })),'
);

code = code.replace(
  /setSelectedIndustry: \(industry\) => set\(\{ selectedIndustry: industry \}\),/,
  'setSelectedIndustry: (industry) => set({ selectedIndustry: Array.isArray(industry) ? industry : (industry === "all" ? [] : [industry]) }),\n  toggleIndustry: (industry) => set((state) => ({ selectedIndustry: industry === "all" ? [] : (state.selectedIndustry.includes(industry) ? state.selectedIndustry.filter(d => d !== industry) : [...state.selectedIndustry, industry]) })),'
);

fs.writeFileSync('src/store/useUIStore.ts', code);
console.log('patched store');
