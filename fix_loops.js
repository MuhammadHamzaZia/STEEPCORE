import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

const cattypeLoop = `              {categoryTypes.map((d) => (
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
              ))}`;

const indLoop = `              {industries.map((d) => (
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
              ))}`;

const domLoop = `              {domainsList.map((d) => (
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
              ))}`;

code = code.replace(/\{categoryTypes\.map\(\(d\) => \([\s\S]*?\}\)\)\}/, cattypeLoop);
code = code.replace(/\{industries\.map\(\(d\) => \([\s\S]*?\}\)\)\}/, indLoop);
code = code.replace(/\{domainsList\.map\(\(d\) => \([\s\S]*?\}\)\)\}/, domLoop);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('Fixed loops');
