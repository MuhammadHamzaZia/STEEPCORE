import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onChange={() => setSelectedCategoryType(d.name)}')) {
    lines[i] = ''; // remove input
    // find label before
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].includes('<label className="flex items-center gap-3 cursor-pointer group">')) {
        lines[j] = '                  <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSelectedCategoryType(selectedCategoryType === d.name && d.name !== "all" ? "all" : d.name); }}>';
        break;
      }
    }
  }
  
  if (lines[i].includes('onChange={() => setSelectedIndustry(d.name)}')) {
    lines[i] = '';
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].includes('<label className="flex items-center gap-3 cursor-pointer group">')) {
        lines[j] = '                  <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSelectedIndustry(selectedIndustry === d.name && d.name !== "all" ? "all" : d.name); }}>';
        break;
      }
    }
  }
  
  if (lines[i].includes('onChange={() => setSelectedDomain(d.name)}')) {
    lines[i] = '';
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].includes('<label className="flex items-center gap-3 cursor-pointer group">')) {
        lines[j] = '                  <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSelectedDomain(selectedDomain === d.name && d.name !== "all" ? "all" : d.name); }}>';
        break;
      }
    }
  }
}

fs.writeFileSync('src/components/CatalogPage.tsx', lines.join('\n'));
console.log('Fixed using array iteration');
