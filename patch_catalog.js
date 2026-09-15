import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Fix 1: filteredBlueprints.length === 0 but hasMore is true
const oldEmptyState = `          ) : filteredBlueprints.length === 0 ? (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-12 max-w-md mx-auto text-center mt-12">`;
            
const newEmptyState = `          ) : filteredBlueprints.length === 0 && !hasMore ? (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-12 max-w-md mx-auto text-center mt-12">`;

code = code.replace(oldEmptyState, newEmptyState);

// Fix 2: Always render the grid/loader if there are items OR if we are still fetching (hasMore)
const oldGrid = `          ) : (
            
            <div className="flex flex-col gap-10 w-full pb-20 md:pb-6">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6 w-full">`;

const newGrid = `          ) : (
            
            <div className="flex flex-col gap-10 w-full pb-20 md:pb-6">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6 w-full">`;

// Wait, the logic is now:
// if isLoading (which is page 1 loading): show spinner
// else if filteredBlueprints === 0 && !hasMore: show Empty State
// else: show grid with filteredBlueprints AND hasMore spinner
code = code.replace(oldGrid, newGrid);

// Also need to make sure we increase pageSize to 50 for faster fetching
const oldFetchPage = `const bps = await api.getBlueprints(page, 20);`;
const newFetchPage = `const bps = await api.getBlueprints(page, 50);`;
code = code.replace(oldFetchPage, newFetchPage);

const oldFetchCheck = `if (bps.length < 20) {`;
const newFetchCheck = `if (bps.length < 50) {`;
code = code.replace(oldFetchCheck, newFetchCheck);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched catalog');
