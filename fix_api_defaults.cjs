const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/nodesCount: bp\.nodes\?\.length \|\| 0,/g, 
  "rating: bp.rating || 0,\n  starsCount: bp.starsCount || 0,\n  price: bp.price || 0,\n  techStack: bp.techStack || [],\n  nodesCount: bp.nodes?.length || 0,");

code = code.replace(/nodesCount: data\.nodes\?\.length \|\| 0, creator:/g, 
  "rating: data.rating || 0, starsCount: data.starsCount || 0, price: data.price || 0, techStack: data.techStack || [], nodesCount: data.nodes?.length || 0, creator:");

fs.writeFileSync(file, code);
