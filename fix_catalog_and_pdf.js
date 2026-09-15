import fs from 'fs';

// Fix CatalogPage
let catalogCode = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');
catalogCode = catalogCode.replace(
  /\{selectedDomain === 'all' \? 'All Domains' : domainsList\.find\(d => d\.name === selectedDomain\)\?\.label\}/,
  "{selectedDomain.length === 0 ? 'All Domains' : selectedDomain.map(sd => domainsList.find(d => d.name === sd)?.label).join(', ')}"
);
fs.writeFileSync('src/components/CatalogPage.tsx', catalogCode);

// Fix RoadmapWorkspace
let rmCode = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');
rmCode = rmCode.replace(
  /const transform = getViewportForBounds\(\s*nodesBounds,\s*width,\s*height,\s*0\.5,\s*2\s*\);/,
  "const transform = getViewportForBounds(\n        nodesBounds,\n        width,\n        height,\n        0.5,\n        2,\n        0.1 // padding\n      );"
);
fs.writeFileSync('src/components/RoadmapWorkspace.tsx', rmCode);
console.log('Fixed TS errors');
