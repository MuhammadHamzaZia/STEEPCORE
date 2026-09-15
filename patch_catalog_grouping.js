import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Remove groupedBlueprints calculation
code = code.replace(
  /\/\/ Group blueprints by category[\s\S]*?\}, \{\}\), \[filteredBlueprints\]\);/,
  ""
);

// Replace the rendering logic for groupedBlueprints with a flat grid
const renderFlatGrid = `<div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6 w-full pb-20 md:pb-6">
              {filteredBlueprints.map((bp: any) => (
                <BlueprintCard 
                  key={bp.id}
                  id={bp.id}
                  username={bp.creator?.name?.replace('@', '') || 'unknown'}
                  repo={bp.slug}
                  title={bp.title}
                  description={bp.description}
                  nodesCount={bp.nodesCount}
                  price={bp.price}
                  originType={bp.source}
                  onCardClick={handleCardClick}
                  isBookmarked={savedBlueprintIds.includes(bp.id)}
                  onBookmarkClick={handleBookmarkClick}
                />
              ))}
            </div>`;

code = code.replace(
  /\{Object\.entries\(groupedBlueprints\)[\s\S]*?\)\}\)\}\n\s*<\/div>/,
  renderFlatGrid
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('Patched catalog page grouping');
