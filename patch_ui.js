import fs from 'fs';

// 1. Fix ProductDetailPage Error (Null Blueprint)
let productContent = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// Insert a null check after the loading state but before the return
const nullCheck = `
  if (!isLoading && !blueprint) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center bg-canvas-default p-8">
        <div className="text-fg-muted mb-4">Blueprint not found or you don't have access.</div>
        <button onClick={onBack ? onBack : onNavigateToCatalog} className="px-4 py-2 bg-canvas-inset border border-border-default rounded-md text-sm">
          Go Back
        </button>
      </div>
    );
  }
`;

// Where to insert? Before `return (` around line 100
// Wait, `onBack` isn't a prop in ProductDetailPage. Let's just use `onNavigateToCatalog`.
const nullCheckClean = `
  if (!isLoading && !blueprint) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center bg-canvas-default p-8">
        <div className="text-fg-muted mb-4">Blueprint not found or you don't have access.</div>
        <button onClick={onNavigateToCatalog} className="px-4 py-2 bg-canvas-inset border border-border-default rounded-md text-sm">
          Go Back
        </button>
      </div>
    );
  }
`;

productContent = productContent.replace(
  "  return (\n    <div className=\"flex-1 w-full flex flex-col bg-canvas-default overflow-y-auto\">",
  nullCheckClean + "\n  return (\n    <div className=\"flex-1 w-full flex flex-col bg-canvas-default overflow-y-auto\">"
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', productContent);

// 2. Fix RoadmapWorkspace Toolbar
let workspaceContent = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// The toolbar container
workspaceContent = workspaceContent.replace(
  /<div className="h-14 border-b border-border-default bg-canvas-surface flex items-center justify-between px-4 z-50">/,
  '<div className="min-h-[56px] border-b border-border-default bg-canvas-surface flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 sm:py-0 z-50 gap-2">'
);

// Left side container
workspaceContent = workspaceContent.replace(
  /<div className="flex items-center gap-3">/,
  '<div className="flex items-center gap-1 sm:gap-3">'
);

// Menu button
workspaceContent = workspaceContent.replace(
  /className="md:hidden p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors"/,
  'className="md:hidden p-1.5 sm:p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors"'
);

// Back button
workspaceContent = workspaceContent.replace(
  /className="p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors"/,
  'className="p-1.5 sm:p-2 hover:bg-canvas-inset rounded-md text-fg-muted hover:text-fg-default transition-colors"'
);

// Workspace text (hide on very small screens)
workspaceContent = workspaceContent.replace(
  /<span>Workspace<\/span>/,
  '<span className="hidden xs:inline sm:inline">Workspace</span>'
);

// Right side container
workspaceContent = workspaceContent.replace(
  /<div className="flex items-center gap-2">/,
  '<div className="flex items-center gap-1 sm:gap-2">'
);

// Buttons padding
workspaceContent = workspaceContent.replace(
  /px-3 py-1\.5 text-sm bg-canvas-inset/g,
  'px-2 py-1.5 sm:px-3 text-sm bg-canvas-inset'
);

workspaceContent = workspaceContent.replace(
  /px-3 py-1\.5 text-sm bg-action-primary/g,
  'px-2 py-1.5 sm:px-3 text-sm bg-action-primary'
);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', workspaceContent);

