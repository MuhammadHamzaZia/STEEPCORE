import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

if (!content.includes("import { useAuthStore }")) {
  content = content.replace("import { useUIStore } from '../store/useUIStore';", "import { useUIStore } from '../store/useUIStore';\nimport { useAuthStore } from '../store/useAuthStore';");
}

if (!content.includes("const { user } = useAuthStore();")) {
  content = content.replace("const { setSelectedBlueprintId", "const { user } = useAuthStore();\n  const { setSelectedBlueprintId");
}

fs.writeFileSync('src/components/DashboardPage.tsx', content);
