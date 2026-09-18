const fs = require('fs');
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

// We need to add debouncedSearch
const debouncedSearchCode = `
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  useEffect(() => {
     setPage(1);
     setBlueprints([]);
  }, [debouncedSearch]);
`;

code = code.replace(
  `  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);`,
  debouncedSearchCode
);

const fetchCode = `
  useEffect(() => {
    const fetchBlueprintsPage = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      
      try {
        let bps = [];
        if (debouncedSearch && debouncedSearch.trim().length > 0) {
           if (page === 1) {
              bps = await api.searchBlueprints(debouncedSearch);
           }
           setHasMore(false);
        } else {
           bps = await api.getBlueprints(page, 50);
           setHasMore(bps.length >= 50);
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
  }, [page, debouncedSearch]);
`;

code = code.replace(/useEffect\(\(\) => \{\s+const fetchBlueprintsPage = async \(\) => \{[\s\S]*?fetchBlueprintsPage\(\);\s+\}, \[page\]\);/, fetchCode.trim());

// Also remove the auto-fetch loop entirely because it's dangerous
const autoFetchCode = `
  // Auto-fetch more if filters hide too many items
  useEffect(() => {
    if (!isLoading && !isLoadingMore && hasMore && filteredBlueprints.length < 12) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, isLoadingMore, hasMore, filteredBlueprints.length]);
`;

code = code.replace(autoFetchCode, '');

fs.writeFileSync('src/components/CatalogPage.tsx', code);
