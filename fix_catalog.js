import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Replace the categoryTypes map
code = code.replace(
  /\{categoryTypes\.map\(\(d\) => \([\s\S]*?\)\)\}/,
  `{categoryTypes.map((d) => {
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
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${isSelected ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${isSelected ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                </li>
              );})}`
);

// Replace the industries map
code = code.replace(
  /\{industries\.map\(\(d\) => \([\s\S]*?\)\)\}/,
  `{industries.map((d) => {
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
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${isSelected ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${isSelected ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                </li>
              );})}`
);

// Replace the domains map
code = code.replace(
  /\{domainsList\.map\(\(d\) => \([\s\S]*?\)\)\}/,
  `{domainsList.map((d) => {
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
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${isSelected ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${isSelected ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                </li>
              );})}`
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
