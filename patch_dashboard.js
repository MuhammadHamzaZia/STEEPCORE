import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

// Replace local state with global
content = content.replace(
  "const { setSelectedBlueprintId } = useUIStore();",
  "const { setSelectedBlueprintId, activeTab: globalActiveTab, setActiveTab: setGlobalActiveTab } = useUIStore();"
);

content = content.replace(
  "const [activeTab, setActiveTab] = useState<TabId>('overview');",
  "const activeTab = globalActiveTab as TabId || 'overview';\n  const setActiveTab = setGlobalActiveTab;"
);

fs.writeFileSync('src/components/DashboardPage.tsx', content);
