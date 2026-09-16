import fs from 'fs';

let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const target = `{isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <img src="/loader.svg" alt="Loading"  className="w-8 h-8 animate-spin text-action-accent object-contain"  />
                <p className="text-fg-muted font-mono text-sm animate-pulse">Processing graph vectors...</p>
              </div>
            </div>
          )}`;

const replacement = `{isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-canvas-default/80 backdrop-blur-md transition-all duration-300">
              <div className="bg-canvas-surface border border-border-default rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center text-center relative max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute inset-0 bg-action-primary/5 blur-3xl rounded-full"></div>
                <img src="/loader.svg" alt="Loading" className="w-12 h-12 animate-spin mb-4 object-contain drop-shadow-md z-10" />
                <p className="text-fg-muted text-sm font-medium flex items-center gap-2 z-10 bg-canvas-inset px-4 py-1.5 rounded-full border border-border-default">
                  <span className="inline-block w-2 h-2 rounded-full bg-action-primary animate-pulse shadow-[0_0_8px_rgba(35,134,54,0.6)]"></span>
                  Generating vectors...
                </p>
              </div>
            </div>
          )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
