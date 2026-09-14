import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Add the state variables
code = code.replace(
  /selectedDomain, setSelectedDomain,/,
  'selectedDomain, setSelectedDomain,\n    selectedCategoryType, setSelectedCategoryType,\n    selectedIndustry, setSelectedIndustry,'
);

// We need to define the mockup lists that are "managed by API"
const newLists = `
  // Mock API Data for broader categorization
  const categoryTypes = [
    { name: 'all', label: 'All Categories' },
    { name: 'Role-Based', label: 'Role-Based Paths' },
    { name: 'Skill-Based', label: 'Skill-Based Blueprints' },
    { name: 'Project-Based', label: 'Project-Based Guides' },
  ];

  const industries = [
    { name: 'all', label: 'All Industries' },
    { name: 'IT & Software', label: 'IT & Software' },
    { name: 'Construction', label: 'Construction & Architecture' },
    { name: 'Automotive', label: 'Automotive & Mechanics' },
    { name: 'Healthcare', label: 'Healthcare & Medical' },
    { name: 'Business', label: 'Business & Finance' },
    { name: 'Creative', label: 'Creative & Design' },
  ];

  const domainsList = [
    { name: 'all', label: 'All Domains' },
    { name: 'AI & Data Science', label: 'AI & Data Science' },
    { name: 'Web & Mobile', label: 'Web & Mobile Dev' },
    { name: 'Cloud & DevOps', label: 'Cloud & DevOps' },
    { name: 'Core Engineering', label: 'Core Engineering' },
    { name: 'Other', label: 'Other' }
  ];
`;

code = code.replace(
  /const categoriesList = \[[\s\S]*?\];/,
  newLists
);

// Also need to rewrite categorizeRoadmap to match domainsList for filtering
// Wait, actually I can write new categorizers for the mock filtering
const mockCategorizers = `
function getMockCategoryType(title) {
  const t = (title || '').toLowerCase();
  if (['engineer', 'developer', 'manager', 'architect', 'analyst', 'mechanic', 'designer', 'doctor'].some(k => t.includes(k))) return 'Role-Based';
  if (['build', 'create', 'make', 'project', 'app', 'website', 'car', 'house', 'building'].some(k => t.includes(k))) return 'Project-Based';
  return 'Skill-Based';
}

function getMockIndustry(title) {
  const t = (title || '').toLowerCase();
  if (['car', 'auto', 'mechanic', 'engine'].some(k => t.includes(k))) return 'Automotive';
  if (['house', 'building', 'construction', 'civil', 'architecture'].some(k => t.includes(k))) return 'Construction';
  if (['health', 'doctor', 'nurse', 'medical'].some(k => t.includes(k))) return 'Healthcare';
  if (['business', 'finance', 'trading', 'marketing'].some(k => t.includes(k))) return 'Business';
  if (['design', 'art', 'video', 'music'].some(k => t.includes(k))) return 'Creative';
  return 'IT & Software';
}

function getMockDomain(title) {
  const t = (title || '').toLowerCase();
  if (['ai', 'data', 'ml', 'machine learning'].some(k => t.includes(k))) return 'AI & Data Science';
  if (['web', 'mobile', 'react', 'ios', 'android', 'frontend', 'backend'].some(k => t.includes(k))) return 'Web & Mobile';
  if (['cloud', 'devops', 'aws', 'docker', 'kubernetes'].some(k => t.includes(k))) return 'Cloud & DevOps';
  if (['core', 'system', 'c++', 'rust', 'go', 'java'].some(k => t.includes(k))) return 'Core Engineering';
  return 'Other';
}
`;

code = code.replace(
  /function categorizeRoadmap\(title\) \{[\s\S]*?return 'Other Roadmaps';\n\}/,
  mockCategorizers
);

// In filteredBlueprints:
code = code.replace(
  /const category = categorizeRoadmap\(bp\.title\);\n    const matchesDomain = selectedDomain === 'all' \|\| category === selectedDomain;/,
  `const catType = getMockCategoryType(bp.title);
    const ind = getMockIndustry(bp.title);
    const dom = getMockDomain(bp.title);
    
    const matchesCatType = selectedCategoryType === 'all' || catType === selectedCategoryType;
    const matchesInd = selectedIndustry === 'all' || ind === selectedIndustry;
    const matchesDomain = selectedDomain === 'all' || dom === selectedDomain;`
);

code = code.replace(
  /return matchesSearch && matchesDomain && matchesPrice && matchesAssetType;/,
  'return matchesSearch && matchesDomain && matchesCatType && matchesInd && matchesPrice && matchesAssetType;'
);

// Now update the UI sidebar
const sidebarUI = `
          {/* Category Type Section */}
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
          </div>
`;

code = code.replace(
  /\{\/\* Domain Section \*\/\}[\s\S]*?<\/div>\n\n\s*\{\/\* Price Section \*\/\}/,
  sidebarUI + '\n\n          {/* Price Section */}'
);

code = code.replace(
  /categoriesList\.find\(d => d\.name === selectedDomain\)/,
  'domainsList.find(d => d.name === selectedDomain)'
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched CatalogPage');
