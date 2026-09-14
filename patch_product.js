import fs from 'fs';

let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

const target1 = `  const isOwned = activeRoadmaps[blueprint.id] !== undefined;
  const isFree = blueprint.price === 0;
  const canAccess = isOwned || isFree;`;

const replace1 = `  const isOwned = activeRoadmaps[blueprint.id] !== undefined;
  const isFree = blueprint.price === 0;
  const isCreator = user && blueprint?.creator?.name && (user.username === blueprint.creator.name || user.email === blueprint.creator.name);
  const canAccess = isOwned || isFree || isCreator;`;

const target2 = `              <button 
                onClick={handlePurchaseOrOpen}
                disabled={!canAccess && (isAccessRequested || isProcessingCheckout)}
                className={\`w-full text-white px-4 py-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm \${canAccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-action-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'}\`}
              >
                {canAccess ? (
                  <>
                    🚀 Open in Flowchart Editor
                  </>
                ) : isProcessingCheckout ? (
                  <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
                ) : isAccessRequested ? (
                  'Access Requested ✓'
                ) : (
                  'Request Free Access'
                )}
              </button>`;

const replace2 = `              <button 
                onClick={handlePurchaseOrOpen}
                disabled={!canAccess && (isAccessRequested || isProcessingCheckout)}
                className={\`w-full text-white px-4 py-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm \${canAccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-action-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'}\`}
              >
                {canAccess ? (
                  <>
                    🚀 {isCreator ? 'Check and Edit' : 'Open in Flowchart Editor'}
                  </>
                ) : isProcessingCheckout ? (
                  <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
                ) : isAccessRequested ? (
                  'Access Requested ✓'
                ) : (
                  'Request Free Access'
                )}
              </button>`;

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  code = code.replace(target2, replace2);
  fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
  console.log("Success");
} else {
  console.log("Not found target1");
}
