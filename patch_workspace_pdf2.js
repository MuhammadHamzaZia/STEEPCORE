import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// 1. Add jsPDF and html-to-image imports
code = code.replace(
  "import { useUIStore } from '../store/useUIStore';",
  "import { useUIStore } from '../store/useUIStore';\nimport { jsPDF } from 'jspdf';\nimport { toPng } from 'html-to-image';"
);

// 2. Add handleDownloadPdf function inside the component
const insertIndex = code.indexOf('const openSaveModal = () => {');
const downloadFunction = `
  const handleDownloadPdf = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#0d1117',
        pixelRatio: 2,
        filter: (node) => {
          if (node.classList?.contains('react-flow__minimap') || node.classList?.contains('react-flow__controls')) {
            return false;
          }
          return true;
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [element.offsetWidth, element.offsetHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
      pdf.save(\`\${currentBlueprintId ? 'blueprint-' + currentBlueprintId : 'roadmap'}.pdf\`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

`;

code = code.slice(0, insertIndex) + downloadFunction + code.slice(insertIndex);

// 3. Add Download button next to Save
const targetButtons = `<button onClick={onLayout} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-inset border border-border-default hover:bg-canvas-default rounded-md transition-colors">
            <Grid className="w-4 h-4" /> Layout
          </button>
          <button onClick={openSaveModal} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-action-primary hover:bg-action-primary-hover text-white rounded-md transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>`;

const replaceButtons = `<button onClick={handleDownloadPdf} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-inset border border-border-default hover:bg-canvas-default rounded-md transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={onLayout} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-inset border border-border-default hover:bg-canvas-default rounded-md transition-colors">
            <Grid className="w-4 h-4" /> Layout
          </button>
          <button onClick={openSaveModal} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-action-primary hover:bg-action-primary-hover text-white rounded-md transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>`;

if (code.includes(targetButtons)) {
  code = code.replace(targetButtons, replaceButtons);
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success");
} else {
  console.log("Could not find save button to replace.");
}
