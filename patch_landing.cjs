const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

code = code.replace(
  `<div key={bp.id} onClick={() => { setSelectedBlueprintId(bp.id); if (onNavigateToProduct) onNavigateToProduct(); }} className="bg-canvas-surface`,
  `<div key={bp.id} onClick={() => { setSelectedBlueprintId(bp.id); if (onNavigateToProduct) onNavigateToProduct(); }} onMouseEnter={() => { api.getBlueprintById(bp.id).catch(()=>{}) }} className="bg-canvas-surface`
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
