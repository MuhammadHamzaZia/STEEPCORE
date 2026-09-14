import fs from 'fs';
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Replace UIStore properties
code = code.replace(
  /const \{ setSelectedDomain, setSelectedBlueprintId \} = useUIStore\(\);/,
  'const { setSelectedDomain, setSelectedCategoryType, setSelectedIndustry, setSelectedBlueprintId } = useUIStore();'
);

// Update handleDomainClick to something more robust for the new macro categories
const newHandler = `
  const handleCategoryClick = (catType: string, industry: string, domain: string) => {
    setSelectedCategoryType(catType);
    setSelectedIndustry(industry);
    setSelectedDomain(domain);
    if (onNavigateToCatalog) onNavigateToCatalog();
  };
`;

code = code.replace(
  /const handleDomainClick = \(domain: string\) => \{[\s\S]*?\};\n/,
  newHandler
);

// Update the Top Categories HTML
const newCards = `
          <div onClick={() => handleCategoryClick('Role-Based', 'all', 'all')} className="bg-canvas-surface border border-border-default rounded-lg p-5 flex items-start gap-4 hover:border-action-accent transition-colors cursor-pointer group">
            <div className="bg-[#1f6feb]/10 p-3 rounded-lg text-[#2f81f7]">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-fg-default group-hover:text-action-accent transition-colors">Role-Based Paths</h3>
              <p className="text-sm text-fg-muted mt-1">Engineer, Designer, Manager, Builder</p>
            </div>
          </div>
          
          <div onClick={() => handleCategoryClick('Skill-Based', 'all', 'all')} className="bg-canvas-surface border border-border-default rounded-lg p-5 flex items-start gap-4 hover:border-action-accent transition-colors cursor-pointer group">
            <div className="bg-[#8957e5]/10 p-3 rounded-lg text-[#a371f7]">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-fg-default group-hover:text-action-accent transition-colors">Skill-Based Guides</h3>
              <p className="text-sm text-fg-muted mt-1">Python, Welding, AutoCAD, Marketing</p>
            </div>
          </div>

          <div onClick={() => handleCategoryClick('all', 'Construction', 'all')} className="bg-canvas-surface border border-border-default rounded-lg p-5 flex items-start gap-4 hover:border-action-accent transition-colors cursor-pointer group">
            <div className="bg-[#238636]/10 p-3 rounded-lg text-[#3fb950]">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-fg-default group-hover:text-action-accent transition-colors">Construction & Engineering</h3>
              <p className="text-sm text-fg-muted mt-1">Buildings, Infrastructure, Architecture</p>
            </div>
          </div>
`;

code = code.replace(
  /<div onClick=\{\(\) => handleDomainClick\('Role-Based Paths'\)\} [\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  newCards + '\n        </div>'
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log('patched landing');
