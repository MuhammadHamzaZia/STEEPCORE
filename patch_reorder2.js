import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Extract the useEffect
const target = /\/\/ Auto-fetch more if filters hide too many items\n\s*useEffect\(\(\) => \{\n\s*if \(\!isLoading && \!isLoadingMore && hasMore && filteredBlueprints\.length < 12\) \{\n\s*setPage\(prev => prev \+ 1\);\n\s*\}\n\s*\}, \[isLoading, isLoadingMore, hasMore, filteredBlueprints\.length\]\);/;

const match = code.match(target);
if (match) {
    code = code.replace(match[0], "");
    
    // Insert it after the sortOptions
    code = code.replace(
      /const sortOptions = \[/,
      match[0] + "\n\n  const sortOptions = ["
    );
    
    fs.writeFileSync('src/components/CatalogPage.tsx', code);
    console.log('patched reorder2');
} else {
    console.log('failed to match');
}
