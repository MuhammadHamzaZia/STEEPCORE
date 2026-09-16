import fs from 'fs';

let content = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

const errorMsgTarget = `{errorMsg && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md shadow-lg flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium leading-relaxed">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="shrink-0 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}`;

const errorMsgReplace = `{errorMsg && (
        <div className="absolute top-4 right-4 z-50 bg-canvas-surface border-l-4 border-l-red-500 border border-border-default px-4 py-3 rounded-md shadow-2xl flex items-start gap-3 max-w-[300px] animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 text-xs font-medium leading-relaxed text-fg-default">
            {(() => {
              try {
                const parsed = JSON.parse(errorMsg);
                if (parsed.error && parsed.error.message) return parsed.error.message;
                if (parsed.message) return parsed.message;
              } catch (e) {}
              return errorMsg;
            })()}
          </div>
          <button onClick={() => setErrorMsg(null)} className="shrink-0 hover:text-red-400 text-fg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}`;

content = content.replace(errorMsgTarget, errorMsgReplace);
fs.writeFileSync('src/components/RoadmapWorkspace.tsx', content);
