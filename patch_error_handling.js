import fs from 'fs';

// 1. Add toast/alert state to RoadmapWorkspace
let rmCode = fs.readFileSync('src/components/RoadmapWorkspace.tsx', 'utf8');

// Ensure AlertCircle is imported
if (!rmCode.includes('AlertCircle')) {
  rmCode = rmCode.replace(
    /import \{\s*Loader2,\s*Search/g,
    'import {\n  AlertCircle, Loader2, Search'
  );
}

// Add state for error
rmCode = rmCode.replace(
  /const \[isLoading, setIsLoading\] = useState\(false\);/,
  "const [isLoading, setIsLoading] = useState(false);\n  const [errorMsg, setErrorMsg] = useState<string | null>(null);"
);

// Update generateRoadmap catch block
rmCode = rmCode.replace(
  /\} catch \(err: any\) \{\n      console\.error\(err\);\n    \} finally \{/,
  `} catch (err: any) {
      console.error(err);
      const msg = err?.message || 'An error occurred while generating the roadmap.';
      if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
        setErrorMsg('The AI free generation quota has been exceeded. Please try again later.');
      } else {
        setErrorMsg(msg);
      }
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {`
);

// Add error UI toast
rmCode = rmCode.replace(
  /\{isSaveModalOpen && \(/,
  `{errorMsg && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md shadow-lg flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium leading-relaxed">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="shrink-0 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {isSaveModalOpen && (`
);

fs.writeFileSync('src/components/RoadmapWorkspace.tsx', rmCode);
console.log('patched RoadmapWorkspace error handling');

