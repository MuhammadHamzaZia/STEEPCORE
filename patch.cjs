const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

const target = `              <h2 className="text-xl font-semibold text-fg-default mb-4">Architecture Nodes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;

const replace = `              <h2 className="text-xl font-semibold text-fg-default mb-4">Architecture Nodes</h2>
              
              {!canAccess ? (
                <div className="bg-canvas-surface border border-border-default rounded-lg p-12 text-center flex flex-col items-center gap-4">
                  <Lock size={32} className="text-fg-muted" />
                  <h3 className="text-lg font-medium text-fg-default">Detailed Nodes are Hidden</h3>
                  <p className="text-sm text-fg-muted max-w-md mx-auto">
                    Request free access from the owner to view the complete architectural nodes and clone this blueprint.
                  </p>
                  <button 
                    onClick={handlePurchaseOrOpen} 
                    disabled={isAccessRequested || isProcessingCheckout}
                    className="mt-2 bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingCheckout ? (
                      <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Requesting...</span>
                    ) : isAccessRequested ? (
                      'Access Requested ✓'
                    ) : (
                      'Request Free Access'
                    )}
                  </button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  
  const endTarget = `                )}
              </div>
            </div>
          )}`;
  const endReplace = `                )}
              </div>
              )}
            </div>
          )}`;
          
  code = code.replace(endTarget, endReplace);
  fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}
