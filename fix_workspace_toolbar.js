import fs from 'fs';
let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// Replace the toolbar
content = content.replace(
  '<div className="min-h-[56px] border-b border-border-default bg-canvas-surface flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 sm:py-0 z-50 gap-2">',
  '<div className="h-14 border-b border-border-default bg-canvas-surface flex items-center justify-between px-3 sm:px-4 z-50 flex-nowrap">'
);

// Fix the hidden xs:inline
content = content.replace(
  '<span className="hidden xs:inline sm:inline">Workspace</span>',
  '<span className="hidden sm:inline">Workspace</span>'
);

// Make the right side buttons a bit tighter on mobile
content = content.replace(
  '<div className="flex items-center gap-1 sm:gap-2">',
  '<div className="flex items-center gap-1.5 sm:gap-2">'
);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
