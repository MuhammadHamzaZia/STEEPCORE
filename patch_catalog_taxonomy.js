import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

const declarations = `
  const [categoryTypes, setCategoryTypes] = useState<{name: string, label: string}[]>([{ name: 'all', label: 'All Categories' }]);
  const [industries, setIndustries] = useState<{name: string, label: string}[]>([{ name: 'all', label: 'All Industries' }]);
  const [domainsList, setDomainsList] = useState<{name: string, label: string}[]>([{ name: 'all', label: 'All Domains' }]);
`;

code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(true\);/,
  `const [isLoading, setIsLoading] = useState(true);\n${declarations}`
);

// Update fetchBlueprints to also fetch taxonomy
const newFetch = `
  useEffect(() => {
    const fetchBlueprints = async () => {
      setIsLoading(true);
      try {
        const [bps, cats, inds, doms] = await Promise.all([
          api.getBlueprints(),
          api.getCategories(),
          api.getIndustries(),
          api.getDomains()
        ]);
        setBlueprints(bps);
        setCategoryTypes(cats);
        setIndustries(inds);
        setDomainsList(doms);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlueprints();
  }, []);
`;

code = code.replace(
  /useEffect\(\(\) => \{\n\s*const fetchBlueprints = async \(\) => \{[\s\S]*?\}, \[\]\);/,
  newFetch
);

// Remove the hardcoded lists
code = code.replace(
  /\/\/ Mock API Data for broader categorization[\s\S]*?const domainsList = \[[\s\S]*?\];\n/,
  ''
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('patched CatalogPage taxonomy');
