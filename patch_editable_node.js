import fs from 'fs';

let code = fs.readFileSync('src/components/EditableNode.tsx', 'utf8');

const targetReturn = `<div 
      className={cn("relative transition-all text-center group flex items-center justify-center", containerClass)}
      onDoubleClick={onDoubleClick}
    >
      {bgElement}`;

const replaceReturn = `<div 
      className={cn(
        "relative transition-all text-center group flex items-center justify-center", 
        containerClass,
        data.isCompleted ? "opacity-60 grayscale-[0.5]" : ""
      )}
      onDoubleClick={onDoubleClick}
    >
      {bgElement}
      {data.isCompleted && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 z-30 shadow-lg border-2 border-[#0d1117]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      )}`;

if (code.includes(targetReturn)) {
  code = code.replace(targetReturn, replaceReturn);
  fs.writeFileSync('src/components/EditableNode.tsx', code);
  console.log("Success: EditableNode patched");
} else {
  console.log("Failed: targetReturn not found");
}
