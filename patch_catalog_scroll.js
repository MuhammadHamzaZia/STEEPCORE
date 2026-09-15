import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Add useRef to imports
if (code.includes("import React, { useState, useEffect }")) {
    code = code.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useRef, useCallback }");
}

// Add state for infinite scroll inside CatalogPage component
code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(true\);/,
  "const [isLoading, setIsLoading] = useState(true);\n  const [visibleCount, setVisibleCount] = useState(12);\n  const observer = useRef<IntersectionObserver | null>(null);\n\n  const lastBlueprintElementRef = useCallback((node: HTMLDivElement | null) => {\n    if (isLoading) return;\n    if (observer.current) observer.current.disconnect();\n    observer.current = new IntersectionObserver(entries => {\n      if (entries[0].isIntersecting && visibleCount < filteredBlueprints.length) {\n        setVisibleCount(prev => prev + 12);\n      }\n    });\n    if (node) observer.current.observe(node);\n  }, [isLoading, filteredBlueprints.length, visibleCount]);"
);

// We need to make sure visibleCount resets when filters change
code = code.replace(
  /const filteredBlueprints = React\.useMemo\(\(\) => blueprints\.filter\(bp => \{/g,
  "// Reset visible count when filters change\n  useEffect(() => { setVisibleCount(12); }, [searchQuery, selectedCategoryType, selectedIndustry, selectedDomain, priceFilter, assetTypeFilter, sortBy]);\n\n  const filteredBlueprints = React.useMemo(() => blueprints.filter(bp => {"
);

// Fix the map to slice by visibleCount and attach ref to last element
code = code.replace(
  /\{filteredBlueprints\.map\(\(bp: any\) => \(/g,
  "{filteredBlueprints.slice(0, visibleCount).map((bp: any, index: number) => (\n                <div ref={index === filteredBlueprints.slice(0, visibleCount).length - 1 ? lastBlueprintElementRef : null} key={bp.id}>"
);

// Close the new div we opened above
code = code.replace(
  /onBookmarkClick=\{handleBookmarkClick\}\n\s*\/>\n\s*\)\)}/g,
  "onBookmarkClick={handleBookmarkClick}\n                />\n                </div>\n              ))}"
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched');
