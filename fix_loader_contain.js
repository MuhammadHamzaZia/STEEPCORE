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
  content = content.replace(/<img src="\/loader\.svg" alt="Loading" className="([^"]+)"/g, (match, classes) => {
    if (!classes.includes('object-contain')) {
      return `<img src="/loader.svg" alt="Loading" className="${classes} object-contain"`;
    }
    return match;
  });
  
  content = content.replace(/<img src="\/loader\.svg" alt="Loading"   className="([^"]+)"  style=\{\{ width: (\d+), height: (\d+) \}\}/g, (match, classes, w, h) => {
    if (!classes.includes('object-contain')) {
      return `<img src="/loader.svg" alt="Loading" className="${classes} object-contain" style={{ width: ${w}, height: ${h} }}`;
    }
    return match;
  });

  fs.writeFileSync(file, content);
});
console.log('Added object-contain to loaders');
