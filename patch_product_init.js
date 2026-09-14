import fs from 'fs';

let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

const targetDestruct = `  const { activeRoadmaps, markNodeCompleted } = useLibraryStore();`;
const replaceDestruct = `  const { activeRoadmaps, initializeRoadmap } = useLibraryStore();`;

const targetNav = `    if (onNavigateToEditor) {
      onNavigateToEditor();
    }`;
const replaceNav = `    if (onNavigateToEditor) {
      initializeRoadmap(blueprint.id);
      onNavigateToEditor();
    }`;

if (code.includes(targetDestruct)) {
  code = code.replace(targetDestruct, replaceDestruct);
  code = code.replace(targetNav, replaceNav);
  fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
  console.log("Success: Product Detail patched");
}
