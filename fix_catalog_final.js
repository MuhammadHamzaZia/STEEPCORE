import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// 1. Fix groupedBlueprints reduction
code = code.replace(
  /const cat = categorizeRoadmap\(bp\.title\);/g,
  'const cat = getMockCategoryType(bp.title);'
);

// 2. Remove the old "Domain Section" which still uses categoriesList
code = code.replace(
  /\{\/\* Domain Section \*\/\}[\s\S]*?<\/ul>\s*<\/div>/,
  `          {/* Category Type Section */}
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between mb-3 cursor-pointer group">
              <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Category Type</h3>
              <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
            </div>
            <ul className="space-y-2 text-sm text-fg-muted">
              {categoryTypes.map((d) => (
                <li key={d.name}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${selectedCategoryType === d.name ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {selectedCategoryType === d.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${selectedCategoryType === d.name ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                  <input type="radio" name="cattype" value={d.name} checked={selectedCategoryType === d.name} onChange={() => setSelectedCategoryType(d.name)} className="hidden" />
                </li>
              ))}
            </ul>
          </div>

          {/* Industry Section */}
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between mb-3 cursor-pointer group">
              <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">Industry</h3>
              <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
            </div>
            <ul className="space-y-2 text-sm text-fg-muted">
              {industries.map((d) => (
                <li key={d.name}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${selectedIndustry === d.name ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {selectedIndustry === d.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${selectedIndustry === d.name ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                  <input type="radio" name="industry" value={d.name} checked={selectedIndustry === d.name} onChange={() => setSelectedIndustry(d.name)} className="hidden" />
                </li>
              ))}
            </ul>
          </div>

          {/* Domain Section */}
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between mb-3 cursor-pointer group">
              <h3 className="text-sm font-semibold text-fg-default group-hover:text-action-accent transition-colors">IT Domain (Optional)</h3>
              <ChevronDown size={16} className="text-fg-muted group-hover:text-action-accent transition-colors" />
            </div>
            <ul className="space-y-2 text-sm text-fg-muted">
              {domainsList.map((d) => (
                <li key={d.name}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${selectedDomain === d.name ? 'bg-action-primary border-action-primary' : 'border-border-default group-hover:border-fg-muted'}\`}>
                      {selectedDomain === d.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className={\`group-hover:text-fg-default transition-colors \${selectedDomain === d.name ? 'text-fg-default font-medium' : ''}\`}>{d.label}</span>
                  </label>
                  <input type="radio" name="domain" value={d.name} checked={selectedDomain === d.name} onChange={() => setSelectedDomain(d.name)} className="hidden" />
                </li>
              ))}
            </ul>
          </div>`
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('Final patch applied to CatalogPage.tsx');
