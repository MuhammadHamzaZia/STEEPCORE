import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// The file has something like:
/*
  if (isLoading) {
    useEffect(() => {
    if (activeTab === 'nodes' && selectedBlueprintId && nodes.length === 0) {
      api.getNodesByBlueprintId(selectedBlueprintId).then(setNodes).catch(console.error);
    }
  }, [activeTab, selectedBlueprintId, nodes.length]);
  return (
*/

content = content.replace(
  /if \(isLoading\) \{\s*useEffect\(\(\) => \{\s*if \(activeTab === 'nodes'.*?nodes\.length\]\);\s*return \(/s,
  `useEffect(() => {
    if (activeTab === 'nodes' && selectedBlueprintId && nodes.length === 0) {
      api.getNodesByBlueprintId(selectedBlueprintId).then(setNodes).catch(console.error);
    }
  }, [activeTab, selectedBlueprintId, nodes.length]);

  if (isLoading) {
    return (`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', content);
