import fs from 'fs';
let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// 1. Add xyflow imports
code = code.replace(
  /useReactFlow\n\} from '@xyflow\/react';/,
  "useReactFlow,\n  getNodesBounds,\n  getViewportForBounds\n} from '@xyflow/react';"
);

// 2. Replace handleDownloadPdf
const newPdfCode = `  const handleDownloadPdf = async () => {
    const { getNodes } = reactFlowInstance;
    const nodes = getNodes();
    if (nodes.length === 0) return;
    
    // We capture the viewport which contains the nodes, not the container, 
    // so it doesn't include controls/minimap automatically.
    const element = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!element) return;
    
    try {
      const nodesBounds = getNodesBounds(nodes);
      const padding = 50;
      
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;
      
      const transform = getViewportForBounds(
        nodesBounds,
        width,
        height,
        0.5,
        2
      );
      
      const dataUrl = await toPng(element, {
        backgroundColor: '#0d1117',
        width: width,
        height: height,
        style: {
          width: \`\${width}px\`,
          height: \`\${height}px\`,
          transform: \`translate(\${transform.x}px, \${transform.y}px) scale(\${transform.zoom})\`,
        },
      });
      
      // We will create a paginated A4 document if it's large, ensuring 100% readability.
      // Standard A4 dimensions in px (72 dpi)
      const a4Width = 595.28;
      const a4Height = 841.89;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [a4Width, a4Height]
      });
      
      const pagesX = Math.ceil(width / a4Width);
      const pagesY = Math.ceil(height / a4Height);
      
      for (let y = 0; y < pagesY; y++) {
        for (let x = 0; x < pagesX; x++) {
          if (x > 0 || y > 0) {
            pdf.addPage([a4Width, a4Height], 'portrait');
          }
          pdf.addImage(dataUrl, 'PNG', -x * a4Width, -y * a4Height, width, height);
        }
      }
      
      pdf.save(\`\${currentBlueprintId ? 'blueprint-' + currentBlueprintId : 'roadmap'}.pdf\`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };`;

code = code.replace(
  /const handleDownloadPdf = async \(\) => \{[\s\S]*?catch \(err\) \{\n      console\.error\('Error generating PDF:', err\);\n    \}\n  \};/,
  newPdfCode
);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
console.log('patched');
