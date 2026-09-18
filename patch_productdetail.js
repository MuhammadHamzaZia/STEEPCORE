import fs from 'fs';

let content = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

content = content.replace(
  'await api.requestBlueprintAccess(blueprint.id);',
  'await api.requestBlueprintAccess(blueprint.id, blueprint.creatorId);'
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', content);
