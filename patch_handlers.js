import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Update BlueprintCardProps
code = code.replace(
  /onClick\?: \(\) => void;\n  isBookmarked: boolean;\n  onToggleBookmark: \(e: React\.MouseEvent\) => void;/,
  'onCardClick?: (id: string) => void;\n  isBookmarked: boolean;\n  onBookmarkClick: (e: React.MouseEvent, id: string) => void;'
);

// Update BlueprintCard signature
code = code.replace(
  /originType, onClick, isBookmarked, onToggleBookmark \}\) => \(/,
  'originType, onCardClick, isBookmarked, onBookmarkClick }) => ('
);

// Update BlueprintCard usage inside its own JSX
code = code.replace(
  /<div onClick=\{onClick\}/,
  '<div onClick={() => onCardClick && onCardClick(id)}'
);

code = code.replace(
  /<button onClick=\{onToggleBookmark\}/,
  '<button onClick={(e) => onBookmarkClick(e, id)}'
);

// Create the memoized handlers inside CatalogPage
const handlers = `
  const handleCardClick = React.useCallback((id: string) => {
    setSelectedBlueprintId(id);
    if (onNavigateToProduct) onNavigateToProduct();
  }, [setSelectedBlueprintId, onNavigateToProduct]);

  const handleBookmarkClick = React.useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleBookmark(id);
  }, [toggleBookmark]);
`;

code = code.replace(
  /const toggleAssetType =/,
  handlers + '\n\n  const toggleAssetType ='
);

// Update BlueprintCard instantiation
code = code.replace(
  /onClick=\{\(\) => \{\s*setSelectedBlueprintId\(bp\.id\);\s*if \(onNavigateToProduct\) onNavigateToProduct\(\);\s*\}\}/g,
  'onCardClick={handleCardClick}'
);

code = code.replace(
  /onToggleBookmark=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*toggleBookmark\(bp\.id\);\s*\}\}/g,
  'onBookmarkClick={handleBookmarkClick}'
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched handlers');
