const fs = require('fs');

const pdFile = '/app/applet/src/components/ProductDetailPage.tsx';
let pdCode = fs.readFileSync(pdFile, 'utf8');
pdCode = pdCode.replace(/blueprint\.creator\.avatar/g, "blueprint?.creator?.avatar");
pdCode = pdCode.replace(/blueprint\.creator\.name/g, "blueprint?.creator?.name");
fs.writeFileSync(pdFile, pdCode);

const lpFile = '/app/applet/src/components/LandingPage.tsx';
let lpCode = fs.readFileSync(lpFile, 'utf8');
lpCode = lpCode.replace(/bp\.creator\.name/g, "bp?.creator?.name");
fs.writeFileSync(lpFile, lpCode);

