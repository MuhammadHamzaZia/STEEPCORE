import fs from 'fs';

let content = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// I need to find the entire breadcrumb bar and replace it cleanly.
const regex = /\{\/\* Breadcrumb Top Bar \*\/\}([\s\S]*?)<\/div>\s*<\/div>/;

const replacement = `{/* Breadcrumb Top Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-default bg-canvas-default sticky top-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-fg-muted max-w-6xl mx-auto w-full overflow-x-auto custom-scrollbar pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
          <span className="text-fg-default font-medium truncate shrink-0">{blueprint.title}</span>
        </div>
      </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/ProductDetailPage.tsx', content);
