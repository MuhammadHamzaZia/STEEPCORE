import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace('className="flex flex-col h-full bg-canvas-default text-fg-default font-sans"', 'className="flex flex-col flex-1 h-full w-full bg-canvas-default text-fg-default font-sans"');

fs.writeFileSync('src/components/Layout.tsx', content);
