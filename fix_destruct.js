import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');
code = code.replace(/    selectedIndustry, setSelectedIndustry, \n/g, '');
code = code.replace(/    selectedDomain, setSelectedDomain,\n/g, '');
fs.writeFileSync('src/components/CatalogPage.tsx', code);
