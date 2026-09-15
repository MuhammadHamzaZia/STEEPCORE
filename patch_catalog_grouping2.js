import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Replace groupedBlueprints definition
code = code.replace(
  /const groupedBlueprints = React\.useMemo\([\s\S]*?\}, \{\}\), \[filteredBlueprints\]\);/,
  ""
);

// Replace the rendering block
const oldRender = `{Object.entries(groupedBlueprints).map(([category, bps]) => (
                <div key={category} className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-fg-default flex items-center gap-2">
                    {category}
                    <span className="text-xs font-normal text-fg-muted bg-canvas-inset px-2 py-0.5 rounded-full border border-border-default">{(bps as any).length}</span>
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6">
                    {(bps as any).map((bp: any) => (
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
                  </div>
                </div>
              ))}`;

const newRender = `<div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 sm:gap-6 w-full">
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

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched successfully');
