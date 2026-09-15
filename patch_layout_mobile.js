import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Show STEEPCORE on mobile too
content = content.replace(
  'className="font-bold text-fg-default tracking-tight hidden sm:block cursor-pointer ml-2 text-lg"',
  'className="font-bold text-fg-default tracking-tight cursor-pointer ml-2 text-lg"'
);

fs.writeFileSync('src/components/Layout.tsx', content);
