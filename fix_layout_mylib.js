import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  "onClick={() => onNavigate && onNavigate('dashboard')}\n              className=\"text-fg-muted hover:text-fg-default transition-colors\"\n            >\n              My Library",
  "onClick={() => { if(onNavigate){ useUIStore.getState().setActiveTab('saved'); onNavigate('dashboard'); } }}\n              className=\"text-fg-muted hover:text-fg-default transition-colors\"\n            >\n              My Library"
);

fs.writeFileSync('src/components/Layout.tsx', content);
