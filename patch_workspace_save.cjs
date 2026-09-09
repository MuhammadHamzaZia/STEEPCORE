const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('isSaveModalOpen')) {
    // 1. Add state for save modal
    code = code.replace(
        'const [nodeLabel, setNodeLabel] = useState("");',
        `const [nodeLabel, setNodeLabel] = useState("");
  
  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [savePrice, setSavePrice] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);`
    );

    // 2. Add save logic
    const saveLogic = `  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;
    
    setIsSaving(true);
    try {
      const payload = {
        title: saveTitle,
        description: saveDesc,
        price: savePrice,
        isPublished: isPublic,
        nodes: nodes.map(n => ({
          label: typeof n.data.label === 'string' ? n.data.label : 'Node',
          type: typeof n.data.type === 'string' ? n.data.type : 'topic',
          positionX: n.position.x,
          positionY: n.position.y
        })),
        edges: edges.map(e => ({
          source: e.source,
          target: e.target,
          label: e.label ? String(e.label) : ''
        }))
      };
      
      const response = await fetch('/api/blueprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('auth_token') || ''}\`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('You must be logged in to save a roadmap to your profile.');
        } else {
          alert('Failed to save roadmap.');
        }
        return;
      }
      
      setIsSaveModalOpen(false);
      alert('Roadmap saved successfully to your profile!');
    } catch (err) {
      console.error(err);
      alert('Error saving roadmap.');
    } finally {
      setIsSaving(false);
    }
  };

  const openSaveModal = () => {
    // Check login
    if (!localStorage.getItem('auth_token')) {
        alert("Please login using the Top Right menu before saving a roadmap to your profile.");
        return;
    }
    setSaveTitle(initialRole || 'Custom Roadmap');
    setIsSaveModalOpen(true);
  };`;
    
    code = code.replace('const onConnect = useCallback', saveLogic + '\n\n  const onConnect = useCallback');

    // 3. Update Save Button
    code = code.replace(
        '<Save className="w-4 h-4" /> Save\n          </button>',
        '<Save className="w-4 h-4" /> Save\n          </button>'
    ).replace(
        '<button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-inset border border-border-default hover:bg-canvas-default rounded-md transition-colors">\n            <Save className="w-4 h-4" /> Save\n          </button>',
        `<button onClick={openSaveModal} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-action-primary hover:bg-action-primary-hover text-white rounded-md transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>`
    );

    // 4. Add Modal JSX at the end of return inside the main div
    const modalJSX = `
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-canvas-surface border border-border-default rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-default flex justify-between items-center">
              <h3 className="text-lg font-semibold text-fg-default flex items-center gap-2">
                <Save className="w-5 h-5 text-action-accent" /> Save Roadmap
              </h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-fg-muted hover:text-fg-default">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1">Title</label>
                <input required type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} className="w-full bg-canvas-inset border border-border-default rounded-md px-3 py-2 text-sm text-fg-default focus:border-action-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1">Description</label>
                <textarea rows={3} value={saveDesc} onChange={e => setSaveDesc(e.target.value)} className="w-full bg-canvas-inset border border-border-default rounded-md px-3 py-2 text-sm text-fg-default focus:border-action-accent focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1">Price ($)</label>
                <input type="number" min="0" step="0.01" value={savePrice} onChange={e => setSavePrice(Number(e.target.value))} className="w-full bg-canvas-inset border border-border-default rounded-md px-3 py-2 text-sm text-fg-default focus:border-action-accent focus:outline-none" />
                <p className="text-xs text-fg-muted mt-1">Set to 0 for free.</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded border-border-default text-action-accent focus:ring-action-accent" />
                <label htmlFor="public" className="text-sm font-medium text-fg-default">Publish to STEEPCORE Marketplace</label>
              </div>
              <p className="text-xs text-fg-muted ml-6">If unchecked, this roadmap will remain private on your profile.</p>
              
              <div className="pt-4 border-t border-border-default flex justify-end gap-2">
                <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg-default bg-canvas-inset hover:bg-canvas-default border border-border-default rounded-md">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-action-primary hover:bg-action-primary-hover rounded-md flex items-center disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isSaving ? 'Saving...' : 'Save Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );`;
    code = code.replace('    </div>\n  );\n}\n', modalJSX + '\n}\n');
    
    fs.writeFileSync(file, code);
    console.log("RoadmapWorkspace updated");
}
