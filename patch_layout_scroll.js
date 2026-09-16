import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Change h-screen to h-full
content = content.replace('className="flex flex-col h-screen', 'className="flex flex-col h-full');

// Add custom-scrollbar to main
content = content.replace('<main className="flex-1 flex flex-col overflow-y-auto">', '<main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">');

fs.writeFileSync('src/components/Layout.tsx', content);
