import fs from 'fs';

let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// Replace state variables
code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(true\);\n  const \[visibleCount, setVisibleCount\] = useState\(12\);\n  const observer = useRef<IntersectionObserver \| null>\(null\);/,
  `const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);`
);

// Replace observer logic
const oldObserver = /const lastBlueprintElementRef = useCallback[\s\S]*?\}, \[isLoading, filteredBlueprints\.length, visibleCount\]\);/;
const newObserver = `const lastBlueprintElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, hasMore]);`;

code = code.replace(oldObserver, newObserver);

// Replace initial fetch logic
const oldFetch = /useEffect\(\(\) => \{\n\s*const fetchBlueprints = async \(\) => \{[\s\S]*?\}, \[\]\);/;
const newFetch = `useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const [cats, inds, doms] = await Promise.all([
          api.getCategories(),
          api.getIndustries(),
          api.getDomains()
        ]);
        setCategoryTypes(cats);
        setIndustries(inds);
        setDomainsList(doms);
      } catch (error) {
        console.error('Failed to fetch taxonomy data', error);
      }
    };
    fetchTaxonomy();
  }, []);

  useEffect(() => {
    const fetchBlueprintsPage = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      
      try {
        const bps = await api.getBlueprints(page, 20);
        if (bps.length < 20) {
          setHasMore(false);
        }
        if (page === 1) {
          setBlueprints(bps);
        } else {
          setBlueprints(prev => {
            const newBps = [...prev];
            bps.forEach(bp => {
               if (!newBps.find(b => b.id === bp.id)) newBps.push(bp);
            });
            return newBps;
          });
        }
      } catch (error) {
        console.error('Failed to fetch blueprints', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchBlueprintsPage();
  }, [page]);`;

code = code.replace(oldFetch, newFetch);

// Remove the filter-reset-visibleCount hook
code = code.replace(
  /\/\/ Reset visible count when filters change\n\s*useEffect\(\(\) => \{ setVisibleCount\(12\); \}, \[.*?\]\);/,
  ""
);

// Update render map and add loader
const oldRender = /\{filteredBlueprints\.slice\(0, visibleCount\)\.map\(\(bp: any, index: number\) => \(\n\s*<div ref=\{index === filteredBlueprints\.slice\(0, visibleCount\)\.length - 1 \? lastBlueprintElementRef : null\} key=\{bp\.id\}>\n\s*<BlueprintCard[\s\S]*?\/>\n\s*<\/div>\n\s*\)\)\}/;
const newRender = `{filteredBlueprints.map((bp: any) => (
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
              {hasMore && (
                <div ref={lastBlueprintElementRef} className="col-span-full py-8 flex justify-center items-center">
                   <Loader2 className="w-6 h-6 animate-spin text-action-accent opacity-50" />
                </div>
              )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched successfully');
