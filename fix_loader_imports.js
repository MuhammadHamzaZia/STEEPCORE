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
  content = content.replace(/,\s*Loader2\b|\bLoader2\s*,/g, '');
  content = content.replace(/\{\s*Loader2\s*\}/g, '{}'); // in case it's the only one
  fs.writeFileSync(file, content);
});
console.log('Fixed Loader2 imports');
