import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<ProductDetailPage onNavigateToEditor=\{\(\) => handleNavigate\('editor'\)\} \/>/,
  '<ProductDetailPage onNavigateToEditor={() => handleNavigate(\'editor\')} onNavigateToCatalog={() => handleNavigate(\'catalog\')} />'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched App');
