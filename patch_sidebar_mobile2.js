import fs from 'fs';

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// The sidebar itself was just hardcoded to hidden md:flex. Let's fix that so it shows on mobile when toggled via layout.
content = content.replace(
  '<aside className="hidden md:flex w-[260px] h-full bg-[#0d1117] border-r border-[#30363d] flex-col text-[#e6edf3] shrink-0 z-10">',
  '<aside className="flex w-[260px] h-full bg-[#0d1117] border-r border-[#30363d] flex-col text-[#e6edf3] shrink-0 z-10">'
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
