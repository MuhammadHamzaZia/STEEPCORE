import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Replace BlueprintCard with memoized version
code = code.replace(
  /const BlueprintCard: React.FC<BlueprintCardProps> = \(\{/,
  'const BlueprintCard = React.memo<BlueprintCardProps>(({'
);

code = code.replace(
  /    <\/div>\n  <\/div>\n\);/,
  '    </div>\n  </div>\n));'
);

// Memoize filteredBlueprints
const filterStartRegex = /const filteredBlueprints = blueprints\.filter\(bp => \{/;
code = code.replace(
  filterStartRegex,
  'const filteredBlueprints = React.useMemo(() => blueprints.filter(bp => {'
);

const sortEndRegex = /if \(sortBy === 'price-desc'\) return b\.price - a\.price;\n    return 0; \/\/ popular is handled by default order\n  \}\);/;
code = code.replace(
  sortEndRegex,
  `if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // popular is handled by default order
  }), [blueprints, searchQuery, selectedCategoryType, selectedIndustry, selectedDomain, priceFilter, assetTypeFilter, sortBy]);`
);

// Memoize groupedBlueprints
const groupStartRegex = /const groupedBlueprints = filteredBlueprints\.reduce\(\(acc, bp\) => \{/;
code = code.replace(
  groupStartRegex,
  'const groupedBlueprints = React.useMemo(() => filteredBlueprints.reduce((acc, bp) => {'
);

const groupEndRegex = /acc\[cat\]\.push\(bp\);\n    return acc;\n  \}, \{\}\);/;
code = code.replace(
  groupEndRegex,
  `acc[cat].push(bp);
    return acc;
  }, {}), [filteredBlueprints]);`
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched memoization');
