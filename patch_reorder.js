import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Extract lastBlueprintElementRef
const refRegex = /const lastBlueprintElementRef = useCallback\(\(node: HTMLDivElement \| null\) => \{[\s\S]*?\}, \[isLoading, filteredBlueprints\.length, visibleCount\]\);/;
const refMatch = code.match(refRegex);

if (refMatch) {
    code = code.replace(refMatch[0], "");
    
    // Insert after filteredBlueprints
    code = code.replace(
      /const sortOptions = \[/g,
      refMatch[0] + "\n\n  const sortOptions = ["
    );
    
    fs.writeFileSync('src/components/CatalogPage.tsx', code);
    console.log('reordered successfully');
} else {
    console.log('failed to find refMatch');
}
