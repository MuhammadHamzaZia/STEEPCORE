import fs from 'fs';
let content = fs.readFileSync('src/components/EditableNode.tsx', 'utf8');

const additionalTypes = `  } else if (type === 'decision') {
    // Flowchart: Decision - Diamond
    containerClass = 'min-w-[120px] min-h-[120px] max-w-[200px] px-6 py-6';
    textClass = 'text-purple-300 text-[11px] font-bold uppercase tracking-wider';
    bgElement = <div className="absolute inset-0 bg-[#0a121e]/90 backdrop-blur-xl border border-purple-500/30 rotate-45 rounded shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-colors group-hover:border-purple-400 scale-75" />;
  } else if (type === 'database') {
    // Flowchart: Database - Cylinder representation
    containerClass = 'min-w-[160px] max-w-[220px] px-6 py-5';
    textClass = 'text-emerald-300 text-xs font-semibold';
    bgElement = <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm border-2 border-emerald-500/30 rounded-xl transition-colors group-hover:border-emerald-500/60 shadow-[0_4px_0_rgba(16,185,129,0.2)] border-b-8" />;
  }`;

content = content.replace(
  "  return (\n    <div ",
  additionalTypes + "\n  return (\n    <div "
);

fs.writeFileSync('src/components/EditableNode.tsx', content);
