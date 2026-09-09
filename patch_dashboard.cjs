const fs = require('fs');
const file = '/app/applet/src/components/DashboardPage.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('myBlueprints')) {
    code = code.replace(
        'const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);',
        `const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);
  const [myBlueprints, setMyBlueprints] = useState<Blueprint[]>([]);`
    );

    const oldFetch = `    const fetchSavedData = async () => {
      setIsLoading(true);
      try {
        const allBlueprints = await api.getBlueprints();
        const saved = allBlueprints.filter(bp => savedBlueprintIds.includes(bp.id));
        setSavedBlueprints(saved);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedData();
  }, [savedBlueprintIds]);`;

    const newFetch = `    const fetchSavedData = async () => {
      setIsLoading(true);
      try {
        const allBlueprints = await api.getBlueprints();
        const saved = allBlueprints.filter(bp => savedBlueprintIds.includes(bp.id));
        setSavedBlueprints(saved);
        
        try {
            const my = await api.getMyBlueprints();
            setMyBlueprints(my);
        } catch (authErr) {
            console.log('Not logged in or error fetching my blueprints', authErr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedData();
  }, [savedBlueprintIds]);`;

    code = code.replace(oldFetch, newFetch);
    
    // Now render them in the "created" tab
    const oldCreatedTab = `{activeTab === 'created' && (
            <div className="text-center py-20 text-fg-muted bg-canvas-surface border border-border-default rounded-lg">
              <PenTool className="w-12 h-12 text-border-default mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-fg-default mb-2">No roadmaps created</h3>
              <p className="max-w-md mx-auto mb-6">You haven't designed any custom learning roadmaps yet.</p>
              <button 
                onClick={() => {
                  setSelectedBlueprintId(null);
                  onNavigateToEditor?.();
                }}
                className="bg-action-primary hover:bg-action-primary-hover text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Create New Roadmap
              </button>
            </div>
          )}`;
          
    const newCreatedTab = `{activeTab === 'created' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-fg-default">My Published & Private Roadmaps</h2>
                <button 
                    onClick={() => {
                      setSelectedBlueprintId(null);
                      onNavigateToEditor?.();
                    }}
                    className="bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                  >
                    + Create New
                </button>
              </div>
              
              {myBlueprints.length === 0 ? (
                <div className="text-center py-20 text-fg-muted bg-canvas-surface border border-border-default rounded-lg">
                  <PenTool className="w-12 h-12 text-border-default mx-auto mb-4" />
                  <p className="max-w-md mx-auto">You haven't created any custom learning roadmaps yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBlueprints.map(bp => (
                    <div key={bp.id} className="bg-canvas-surface border border-border-default hover:border-action-accent rounded-lg p-5 flex flex-col group transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-fg-default text-lg group-hover:text-action-accent transition-colors">{bp.title}</h3>
                        <span className={\`text-xs px-2 py-1 rounded-full font-medium \${bp.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}\`}>
                          {bp.isPublished ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <p className="text-sm text-fg-muted line-clamp-2 mb-4 flex-1">{bp.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-border-default">
                        <span className="text-sm font-semibold text-fg-default">{bp.price > 0 ? \`$\${bp.price.toFixed(2)}\` : 'Free'}</span>
                        <button 
                          onClick={() => {
                            setSelectedBlueprintId(bp.id);
                            onNavigateToEditor?.();
                          }}
                          className="text-action-accent hover:text-white bg-action-accent/10 hover:bg-action-accent px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}`;
    code = code.replace(oldCreatedTab, newCreatedTab);
    fs.writeFileSync(file, code);
    console.log("Dashboard updated");
}
