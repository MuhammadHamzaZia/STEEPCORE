import fs from 'fs';
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
code = code.replace(/      <\/div>\n      \{\/\* TRENDING/g, '      {/* TRENDING');
fs.writeFileSync('src/components/LandingPage.tsx', code);
