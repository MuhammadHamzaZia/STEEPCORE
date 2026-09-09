const fs = require('fs');

function replaceSafe(file, search, replace) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(search, replace);
  fs.writeFileSync(file, code);
}

replaceSafe('/app/applet/src/components/LandingPage.tsx', 
  /{bp\.rating\.toFixed\(1\)}/g, 
  "{(bp.rating || 0).toFixed(1)}");

replaceSafe('/app/applet/src/components/ProductDetailPage.tsx', 
  /{blueprint\.rating\.toFixed\(1\)}/g, 
  "{(blueprint.rating || 0).toFixed(1)}");

