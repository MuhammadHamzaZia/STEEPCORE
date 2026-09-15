import fs from 'fs';

const files = [
  'src/components/DashboardPage.tsx',
  'src/components/ProductDetailPage.tsx',
  'src/components/RoadmapWorkspace.tsx',
  'src/components/LandingPage.tsx',
  'src/components/CatalogPage.tsx',
  'src/components/AuthModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<img src="\/loader\.svg"([^>]+)>/g, (match, attrs) => {
    if (!attrs.includes('object-contain')) {
      let newAttrs = attrs.replace(/className="([^"]+)"/, 'className="$1 object-contain"');
      return `<img src="/loader.svg"${newAttrs}>`;
    }
    return match;
  });

  fs.writeFileSync(file, content);
});
console.log('Added object-contain to loaders 2');
