import fs from 'fs';

let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const targetStr = `  return (
    <div 
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >`;

const replacementStr = `  return (
    <div className="flex h-screen bg-canvas-default text-fg-default font-sans">
      
      {/* Header */}
      <header className="h-14 bg-canvas-inset border-b border-border-default flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/Layout.tsx', code);
console.log('Fixed layout');
