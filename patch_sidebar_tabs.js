import fs from 'fs';

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// import useUIStore
if (!content.includes('useUIStore')) {
  content = content.replace("import { useLibraryStore } from '../../store/useLibraryStore';", "import { useLibraryStore } from '../../store/useLibraryStore';\nimport { useUIStore } from '../../store/useUIStore';");
}

content = content.replace(
  "onClick={() => onNavigate('dashboard')}",
  "onClick={() => { useUIStore.getState().setActiveTab('roadmaps'); onNavigate('dashboard'); }}"
);

content = content.replace(
  "onClick={() => onNavigate('dashboard')} // TODO",
  "onClick={() => { useUIStore.getState().setActiveTab('saved'); onNavigate('dashboard'); }}"
);

// We need to be careful with replace, let's just use regex for all three if they exist.
