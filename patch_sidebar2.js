import fs from 'fs';
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const oldBlock = `<div className="mb-8">
          <div className="px-3 text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wider">Domain Filter</div>
          <div className="space-y-1">
            {domains.map(domain => (
              <label 
                key={domain.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3] cursor-pointer"
              >
                <div className={\`w-4 h-4 rounded-full border flex items-center justify-center \${selectedDomain === domain.id ? 'border-[#388bfd]' : 'border-[#30363d]'}\`}>
                  {selectedDomain === domain.id && <div className="w-2 h-2 rounded-full bg-[#388bfd]" />}
                </div>
                <input 
                  type="radio" 
                  name="domain" 
                  className="hidden" 
                  checked={selectedDomain === domain.id}
                  onChange={() => handleDomainSelect(domain.id)}
                />
                <span className={selectedDomain === domain.id ? 'text-[#e6edf3]' : ''}>{domain.label}</span>
              </label>
            ))}
          </div>
        </div>`;

const newBlock = `<div className="mb-8">
          <div className="px-3 text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wider">Quick Filters</div>
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => handleQuickLink(link.type, link.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30363d]"></div>
                  {link.label}
                </div>
              </button>
            ))}
          </div>
        </div>`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
} else {
  // Use regex if exact match fails due to line endings
  code = code.replace(
    /\{\/\* Domain Filter \*\/\}[\s\S]*?<\/div>\n        <\/div>/,
    `{/* Quick Filters */}
        ${newBlock}`
  );
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
console.log('patched sidebar 2');
