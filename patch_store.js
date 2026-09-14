import fs from 'fs';
let code = fs.readFileSync('src/store/useUIStore.ts', 'utf8');

code = code.replace(
  /selectedDomain: string;/,
  'selectedDomain: string;\n  selectedCategoryType: string;\n  selectedIndustry: string;'
);

code = code.replace(
  /setSelectedDomain: \(domain: string\) => void;/,
  'setSelectedDomain: (domain: string) => void;\n  setSelectedCategoryType: (type: string) => void;\n  setSelectedIndustry: (industry: string) => void;'
);

code = code.replace(
  /selectedDomain: 'all',/,
  'selectedDomain: \'all\',\n  selectedCategoryType: \'all\',\n  selectedIndustry: \'all\','
);

code = code.replace(
  /setSelectedDomain: \(domain\) => set\(\{ selectedDomain: domain \}\),/,
  'setSelectedDomain: (domain) => set({ selectedDomain: domain }),\n  setSelectedCategoryType: (type) => set({ selectedCategoryType: type }),\n  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),'
);

fs.writeFileSync('src/store/useUIStore.ts', code);
console.log('patched store');
