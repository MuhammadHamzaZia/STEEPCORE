import fs from 'fs';
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /export function ProductDetailPage\(\{ onNavigateToEditor \}: \{ onNavigateToEditor\?: \(\) => void \}\) \{/,
  'export function ProductDetailPage({ onNavigateToEditor, onNavigateToCatalog }: { onNavigateToEditor?: () => void, onNavigateToCatalog?: () => void }) {'
);

code = code.replace(
  /const \{ selectedBlueprintId, setIsAuthModalOpen \} = useUIStore\(\);/,
  'const { selectedBlueprintId, setIsAuthModalOpen, setSelectedDomain } = useUIStore();'
);

code = code.replace(
  /<div className="flex items-center gap-2 text-sm text-fg-muted max-w-6xl mx-auto w-full">[\s\S]*?<\/div>/,
  `<div className="flex items-center gap-2 text-sm text-fg-muted max-w-6xl mx-auto w-full">
          <button 
            onClick={() => {
              if (onNavigateToCatalog) onNavigateToCatalog();
            }}
            className="text-fg-muted hover:text-action-accent transition-colors"
          >
            Marketplace
          </button>
          <ChevronRight size={14} />
          <button 
            onClick={() => {
              setSelectedDomain(blueprint.domain);
              if (onNavigateToCatalog) onNavigateToCatalog();
            }}
            className="text-fg-muted hover:text-action-accent transition-colors"
          >
            {blueprint.domain}
          </button>
          <ChevronRight size={14} />
          <span className="text-fg-default font-medium truncate">{blueprint.title}</span>
        </div>`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
console.log('patched ProductDetailPage');
