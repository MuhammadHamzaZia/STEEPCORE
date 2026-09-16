import fs from 'fs';

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// The first occurrence of onClick={() => onNavigate('dashboard')} is now patched for Active Learning Paths
// But let's just make it robust.

content = content.replace(/<button \s*onClick=\{\(\) => onNavigate\('dashboard'\)\}\s*className="([^"]+)"\s*>\s*<div className="flex items-center gap-3">\s*<Bookmark size=\{16\} \/>\s*Saved Blueprints/g, 
`<button onClick={() => { useUIStore.getState().setActiveTab('saved'); onNavigate('dashboard'); }} className="$1"><div className="flex items-center gap-3"><Bookmark size={16} />Saved Blueprints`);

content = content.replace(/<button \s*onClick=\{\(\) => onNavigate\('dashboard'\)\}\s*className="([^"]+)"\s*>\s*<div className="flex items-center gap-3">\s*<PenTool size=\{16\} \/>\s*My Published Patterns/g, 
`<button onClick={() => { useUIStore.getState().setActiveTab('created'); onNavigate('dashboard'); }} className="$1"><div className="flex items-center gap-3"><PenTool size={16} />My Published Patterns`);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
