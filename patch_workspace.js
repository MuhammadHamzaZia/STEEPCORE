import fs from 'fs';

let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// 1. Add isSidebarOpen state
content = content.replace(
  "const [leftSidebarTab, setLeftSidebarTab] = useState<'tools' | 'chat'>('tools');",
  "const [leftSidebarTab, setLeftSidebarTab] = useState<'tools' | 'chat'>('tools');\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);"
);

// 2. Add Menu icon to imports if not there
if (!content.includes("Menu,")) {
  content = content.replace(
    "Trash2,",
    "Trash2, Menu,"
  );
}

// 3. Update top toolbar for mobile
content = content.replace(
  /<div className="flex items-center gap-3">\s*<button onClick=\{onBack\}/,
  `<div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onBack}`
);

// 4. Update the buttons in toolbar to be responsive
content = content.replace(
  /Download PDF\s*<\/button>/,
  `<span className="hidden sm:inline">Download PDF</span></button>`
);
content = content.replace(
  /Layout\s*<\/button>/,
  `<span className="hidden sm:inline">Layout</span></button>`
);
content = content.replace(
  /Save\s*<\/button>/,
  `<span className="hidden sm:inline">Save</span></button>`
);


// 5. Update the sidebar layout
const oldSidebar = `<div className="w-72 border-r border-border-default bg-canvas-surface flex flex-col z-10">`;
const newSidebar = `
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Left Sidebar */}
        <div className={\`absolute md:relative z-30 h-full w-80 md:w-80 border-r border-border-default bg-canvas-surface flex flex-col transition-transform duration-300 ease-in-out \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0\`}>`;

content = content.replace(oldSidebar, newSidebar);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
