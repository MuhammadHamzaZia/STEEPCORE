import fs from 'fs';

let code = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// 1. Add jsPDF and html-to-image imports
code = code.replace(
  "import { useUIStore } from '../store/useUIStore';",
  "import { useUIStore } from '../store/useUIStore';\nimport { jsPDF } from 'jspdf';\nimport { toPng } from 'html-to-image';"
);

// 2. Add handleDownloadPdf function inside the component
const insertIndex = code.indexOf('const handleSave = async');
const downloadFunction = `
  const handleDownloadPdf = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;
    
    try {
      // Small timeout to ensure everything is rendered
      const dataUrl = await toPng(element, {
        backgroundColor: '#0d1117',
        pixelRatio: 2,
        filter: (node) => {
          // exclude minimap or controls if needed
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
const saveButtonTarget = `<button 
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-canvas-inset border border-border-default text-fg-muted hover:text-fg-default hover:bg-canvas-surface transition-colors"
              title="Save Blueprint"
            >
              <Save size={18} />
            </button>`;

const saveButtonReplace = `<button 
              onClick={handleDownloadPdf}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-canvas-inset border border-border-default text-fg-muted hover:text-fg-default hover:bg-canvas-surface transition-colors"
              title="Download as PDF"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-action-primary text-white hover:bg-action-primary-hover transition-colors"
              title="Save Blueprint"
            >
              <Save size={18} />
            </button>`;

if (code.includes(saveButtonTarget)) {
  code = code.replace(saveButtonTarget, saveButtonReplace);
  fs.writeFileSync('src/components/RoadmapWorkspace.tsx', code);
  console.log("Success");
} else {
  console.log("Could not find save button to replace.");
}
