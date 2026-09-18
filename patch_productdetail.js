import fs from 'fs';

let content = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// Remove ReactFlow imports
content = content.replace(
  "import { ReactFlow, Background, Controls } from '@xyflow/react';",
  ""
);
content = content.replace(
  "import '@xyflow/react/dist/style.css';",
  ""
);

// We need to defer nodes fetching.
content = content.replace(
  `        const bpNodes = await api.getNodesByBlueprintId(selectedBlueprintId);
        if (bp) setBlueprint(bp);
        setNodes(bpNodes);`,
  `        if (bp) setBlueprint(bp);`
);

// Replace the ReactFlow rendering block
const startReactFlow = content.indexOf('{blueprint && (blueprint as any).nodes');
const endReactFlow = content.indexOf('</ReactFlow>') + 12;

if (startReactFlow !== -1 && endReactFlow !== -1 && endReactFlow > startReactFlow) {
  const replacement = `
              <div className="absolute inset-0 bg-canvas-inset flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '24px 24px', color: 'rgba(255, 255, 255, 0.5)' }}></div>
                
                {/* Abstract Mock Nodes */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center opacity-60">
                    <div className="w-32 h-10 border border-action-accent bg-canvas-surface rounded shadow-[0_0_15px_rgba(35,131,226,0.3)] mb-0"></div>
                    <div className="w-px h-6 bg-border-default"></div>
                    
                    <div className="w-[280px] h-px bg-border-default"></div>
                    
                    <div className="flex gap-12 -mt-px">
                        <div className="flex flex-col items-center">
                            <div className="w-px h-6 bg-border-default"></div>
                            <div className="w-24 h-8 border border-border-default bg-canvas-surface rounded"></div>
                            <div className="w-px h-6 bg-border-default"></div>
                            <div className="w-20 h-8 border border-border-default bg-canvas-surface rounded-full"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-px h-6 bg-border-default"></div>
                            <div className="w-24 h-8 border border-border-default bg-canvas-surface rounded"></div>
                            <div className="w-px h-6 bg-border-default"></div>
                            <div className="w-24 h-8 border border-border-default bg-canvas-surface rounded"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-px h-6 bg-border-default"></div>
                            <div className="w-24 h-8 border border-border-default bg-canvas-surface rounded"></div>
                        </div>
                    </div>
                </div>
              </div>
  `;
  
  // Cut out the old rendering logic completely and replace with static mock
  const beforeRender = content.substring(0, startReactFlow);
  const afterRender = content.substring(content.indexOf('</>') + 3); // Find the closing tag of the fallback
  // Oh wait, let's just replace the exact block:
  
  content = content.replace(
    /\{blueprint && \(blueprint as any\)\.nodes.*?<\/>\s*\)}/s,
    replacement
  );
}

// Add the lazy load hook for nodes
const lazyLoadHook = `
  useEffect(() => {
    if (activeTab === 'nodes' && selectedBlueprintId && nodes.length === 0) {
      api.getNodesByBlueprintId(selectedBlueprintId).then(setNodes).catch(console.error);
    }
  }, [activeTab, selectedBlueprintId, nodes.length]);
`;

content = content.replace(
  "  return (",
  lazyLoadHook + "\n  return ("
);

// Update label from "Interactive Preview" to "Structural Preview"
content = content.replace("Interactive Preview", "Structural Preview");

fs.writeFileSync('src/components/ProductDetailPage.tsx', content);
