import fs from 'fs';

let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(
  /<div[\s\S]*?className="w-8 h-8 bg-canvas-inset border border-border-default rounded-md flex items-center justify-center hover:bg-canvas-surface transition-colors"[\s\S]*?onClick=\{\(\) => setIsSidebarOpen\(\!isSidebarOpen\)\}[\s\S]*?>[\s\S]*?<Terminal size=\{20\} className="text-fg-default" \/>[\s\S]*?<\/div>[\s\S]*?<span[\s\S]*?className="font-semibold text-fg-default tracking-tight hidden sm:block"[\s\S]*?onClick=\{\(\) => onNavigate && onNavigate\('landing'\)\}[\s\S]*?>[\s\S]*?STEEPCORE[\s\S]*?<\/span>/,
  `<div 
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            > 
              <img src="/logo.svg" alt="Steepcore Logo" className="w-8 h-8 object-contain" />
            </div>
            <span 
              className="font-bold text-fg-default tracking-tight hidden sm:block cursor-pointer ml-2 text-lg"
              onClick={() => onNavigate && onNavigate('landing')}
            >
              STEEPCORE
            </span>`
);

fs.writeFileSync('src/components/Layout.tsx', code);
console.log('patched layout logo');
