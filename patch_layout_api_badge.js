import fs from 'fs';
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');
const target = `          {/* API Health Badge */}
          <div 
            title="STEEPCOREAPI Backend Status (https://steepcoreapi.onrender.com)"
            className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas-inset border border-border-default text-[11px] font-mono text-fg-muted"
          >
            <span className={\`w-2 h-2 rounded-full \${apiHealth === 'online' ? 'bg-emerald-500 animate-pulse' : apiHealth === 'offline' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}\`}></span>
            <span>API: {apiHealth === 'online' ? 'Connected' : apiHealth === 'offline' ? 'Offline' : 'Checking'}</span>
          </div>`;
if (code.includes(target)) {
  code = code.replace(target, '');
  fs.writeFileSync('src/components/Layout.tsx', code);
  console.log('Success: API Health Badge removed');
} else {
  console.log('Error: target not found');
}
