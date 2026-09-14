import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Replace category types loop completely
code = code.replace(
  /\{categoryTypes\.map\(\(d\) => \([\s\S]*?\}\)\)\}/,
  `{categoryTypes.map((d) => (
                <li key={d.name}>
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategoryType(selectedCategoryType === d.name && d.name !== 'all' ? 'all' : d.name);
                    }}
                  >
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${selectedCategoryType === d.name ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {selectedCategoryType === d.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${selectedCategoryType === d.name ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                </li>
              ))}`
);

// Replace industries loop completely
code = code.replace(
  /\{industries\.map\(\(d\) => \([\s\S]*?\}\)\)\}/,
  `{industries.map((d) => (
                <li key={d.name}>
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedIndustry(selectedIndustry === d.name && d.name !== 'all' ? 'all' : d.name);
                    }}
                  >
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${selectedIndustry === d.name ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {selectedIndustry === d.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${selectedIndustry === d.name ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                </li>
              ))}`
);

// Replace domains loop completely
code = code.replace(
  /\{domainsList\.map\(\(d\) => \([\s\S]*?\}\)\)\}/,
  `{domainsList.map((d) => (
                <li key={d.name}>
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDomain(selectedDomain === d.name && d.name !== 'all' ? 'all' : d.name);
                    }}
                  >
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${selectedDomain === d.name ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {selectedDomain === d.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${selectedDomain === d.name ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                </li>
              ))}`
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('Fixed all actually');
