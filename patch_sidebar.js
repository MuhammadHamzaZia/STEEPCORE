import fs from 'fs';
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

code = code.replace(
  /const \{ selectedDomain, setSelectedDomain \} = useUIStore\(\);/,
  'const { selectedDomain, setSelectedDomain, setSelectedIndustry, setSelectedCategoryType } = useUIStore();'
);

code = code.replace(
  /const domains = \[[\s\S]*?\];/,
  `const quickLinks = [
    { type: 'cat', id: 'Role-Based', label: 'Role-Based Paths' },
    { type: 'cat', id: 'Skill-Based', label: 'Skill-Based Guides' },
    { type: 'ind', id: 'Construction', label: 'Construction & Eng' },
    { type: 'ind', id: 'Automotive', label: 'Automotive & Auto' },
  ];`
);

const newHandler = `
  const handleQuickLink = (type: string, id: string) => {
    setSelectedDomain('all');
    setSelectedCategoryType('all');
    setSelectedIndustry('all');
    
    if (type === 'cat') setSelectedCategoryType(id);
    if (type === 'ind') setSelectedIndustry(id);
    
    onNavigate('catalog');
  };
`;

code = code.replace(
  /const handleDomainSelect = \(domainId: string\) => \{[\s\S]*?\};\n/,
  newHandler
);

code = code.replace(
  /\{domains\.map\(\(domain\) => \([\s\S]*?\}\)\}/,
  `{quickLinks.map((link) => (
            <button 
              key={link.id}
              onClick={() => handleQuickLink(link.type, link.id)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#30363d]"></div>
                {link.label}
              </div>
            </button>
          ))}`
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
console.log('patched sidebar');
