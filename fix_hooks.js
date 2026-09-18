import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// I need to pull out the useEffect that got stuck inside `if (isLoading)`
const target = `  if (isLoading) {
    useEffect(() => {
    if (activeTab === 'nodes' && selectedBlueprintId && nodes.length === 0) {
      api.getNodesByBlueprintId(selectedBlueprintId).then(setNodes).catch(console.error);
    }
  }, [activeTab, selectedBlueprintId, nodes.length]);
  return (`;

const fixed = `  useEffect(() => {
    if (activeTab === 'nodes' && selectedBlueprintId && nodes.length === 0) {
      api.getNodesByBlueprintId(selectedBlueprintId).then(setNodes).catch(console.error);
    }
  }, [activeTab, selectedBlueprintId, nodes.length]);

  if (isLoading) {
    return (`;

if(content.includes(target)) {
    content = content.replace(target, fixed);
    fs.writeFileSync('src/components/ProductDetailPage.tsx', content);
    console.log("Fixed!");
} else {
    console.log("Could not find the target to replace");
}
