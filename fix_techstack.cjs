const fs = require('fs');

const pdFile = '/app/applet/src/components/ProductDetailPage.tsx';
let pdCode = fs.readFileSync(pdFile, 'utf8');
pdCode = pdCode.replace(/blueprint\.techStack\.map/g, "(blueprint.techStack || []).map");
fs.writeFileSync(pdFile, pdCode);

const lpFile = '/app/applet/src/components/LandingPage.tsx';
let lpCode = fs.readFileSync(lpFile, 'utf8');
lpCode = lpCode.replace(/bp\.techStack\.slice/g, "(bp.techStack || []).slice");
fs.writeFileSync(lpFile, lpCode);

