import fs from 'fs';

let content = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

const target = `      {/* Breadcrumb Top Bar */}
      <div className="px-6 py-4 border-b border-border-default bg-canvas-default sticky top-0 z-20">
        <div className="flex items-center gap-2 text-sm text-fg-muted max-w-6xl mx-auto w-full">`;

const replacement = `      {/* Breadcrumb Top Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-default bg-canvas-default sticky top-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-fg-muted max-w-6xl mx-auto w-full overflow-x-auto custom-scrollbar pb-1 sm:pb-0" style={{ scrollbarWidth: 'none' }}>
          <button 
            onClick={() => {
              if (onNavigateToCatalog) onNavigateToCatalog();
            }}
            className="text-fg-muted hover:text-action-accent transition-colors whitespace-nowrap shrink-0"
          >
            Marketplace
          </button>
          <ChevronRight size={14} className="shrink-0 opacity-50" />
          <button 
            onClick={() => {
              setSelectedDomain(blueprint.domain);
              if (onNavigateToCatalog) onNavigateToCatalog();
            }}
            className="text-fg-muted hover:text-action-accent transition-colors whitespace-nowrap shrink-0"
          >
            {blueprint.domain}
          </button>
          <ChevronRight size={14} className="shrink-0 opacity-50" />
          <span className="text-fg-default font-medium truncate shrink-0">{blueprint.title}</span>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/ProductDetailPage.tsx', content);
