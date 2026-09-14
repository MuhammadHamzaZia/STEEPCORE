import fs from 'fs';

let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// 1. Add imports for ReactFlow
const importTarget = "import { Blueprint, FlowchartNode } from '../types/schema';";
const importReplace = "import { Blueprint, FlowchartNode } from '../types/schema';\nimport { ReactFlow, Background, Controls } from '@xyflow/react';\nimport '@xyflow/react/dist/style.css';";
if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplace);
}

// 2. Locate Canvas Preview Area
const startIndex = code.indexOf('{/* Canvas Preview Area */}');
const endIndex = code.indexOf('{/* Title & Creator');

if (startIndex !== -1 && endIndex !== -1) {
  const replacePreview = `{/* Canvas Preview Area */}
          <div className="w-full h-[300px] bg-canvas-inset border border-border-default rounded-lg relative overflow-hidden mb-8 flex items-center justify-center">
            {blueprint && (blueprint as any).nodes && (blueprint as any).nodes.length > 0 ? (
              <ReactFlow 
                nodes={(blueprint as any).nodes.map((n: any) => ({
                  id: String(n.id),
                  position: { x: n.positionX || n.position?.x || 0, y: n.positionY || n.position?.y || 0 },
                  data: { label: n.label || 'Node' },
                  type: 'default',
                  draggable: false
                }))} 
                edges={(blueprint as any).edges ? (blueprint as any).edges.map((e: any) => ({
                  id: String(e.id),
                  source: String(e.sourceNodeId || e.source),
                  target: String(e.targetNodeId || e.target),
                  animated: true
                })) : []}
                fitView 
                proOptions={{ hideAttribution: true }}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={true}
                zoomOnScroll={true}
              >
                <Background color="#30363d" gap={16} size={1} />
                <Controls showInteractive={false} />
              </ReactFlow>
            ) : (
              <>
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10 flex items-center justify-center h-full w-full opacity-30">
                  <Sparkles className="w-16 h-16 text-fg-muted" />
                </div>
              </>
            )}
            
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-canvas-surface/80 backdrop-blur-sm border border-border-default rounded text-[10px] uppercase tracking-wider font-semibold text-fg-muted flex items-center gap-1.5 z-10 pointer-events-none"> 
              <GitBranch size={12} /> 
              Interactive Preview
            </div>
          </div>
          `;
  code = code.slice(0, startIndex) + replacePreview + code.slice(endIndex);
  fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
  console.log("Success");
} else {
  console.log("Could not find start/end indices");
}

