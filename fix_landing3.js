import fs from 'fs';
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Replace the sequence of 3 </div>s before {/* TRENDING BLUEPRINTS */} with just 2
code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* TRENDING/g, '</div>\n      </div>\n      {/* TRENDING');

fs.writeFileSync('src/components/LandingPage.tsx', code);
