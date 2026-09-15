import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

const targetStr = `fetchBlueprintsPage();\n  }, [page]);`;
const replacementStr = `fetchBlueprintsPage();\n  }, [page]);\n\n  // Auto-fetch more if filters hide too many items\n  useEffect(() => {\n    if (!isLoading && !isLoadingMore && hasMore && filteredBlueprints.length < 12) {\n      setPage(prev => prev + 1);\n    }\n  }, [isLoading, isLoadingMore, hasMore, filteredBlueprints.length]);`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched autofetch');
