import fs from 'fs';

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Hide the standalone sidebar on mobile (Layout already renders this globally!)
content = content.replace(
  '<aside className="w-[260px] h-full bg-[#0d1117] border-r border-[#30363d] flex flex-col text-[#e6edf3] shrink-0">',
  '<aside className="hidden md:flex w-[260px] h-full bg-[#0d1117] border-r border-[#30363d] flex-col text-[#e6edf3] shrink-0 z-10">'
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
