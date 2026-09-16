import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{/* AI Smart Resolution Modal */}
      {isAiLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-action-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="font-semibold text-[#e6edf3] text-lg mb-2">AI Smart Resolution</h3>
            <p className="text-[#7d8590] text-sm font-mono flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Checking 85% vector cache...
            </p>
          </div>
        </div>
      )}`;

const replacement = `{/* AI Smart Resolution Modal */}
      {isAiLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-canvas-surface border border-border-default rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8 flex flex-col items-center justify-center text-center relative">
            <div className="absolute inset-0 bg-action-primary/5 blur-3xl rounded-full"></div>
            <img src="/loader.svg" alt="Loading" className="w-16 h-16 animate-spin mb-6 object-contain drop-shadow-md z-10" />
            <h3 className="font-bold text-fg-default text-xl mb-3 z-10 tracking-tight">AI Smart Resolution</h3>
            <p className="text-fg-muted text-sm font-medium flex items-center gap-2 z-10 bg-canvas-inset px-4 py-1.5 rounded-full border border-border-default">
              <span className="inline-block w-2 h-2 rounded-full bg-action-primary animate-pulse shadow-[0_0_8px_rgba(35,134,54,0.6)]"></span>
              Structuring Architecture...
            </p>
          </div>
        </div>
      )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
