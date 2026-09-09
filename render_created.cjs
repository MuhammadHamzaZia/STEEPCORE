const fs = require('fs');
const file = '/app/applet/src/components/DashboardPage.tsx';
let code = fs.readFileSync(file, 'utf8');

const comingSoonOld = `          {(activeTab === 'created' || activeTab === 'settings') && (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
              <PenTool className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-fg-default mb-2">Coming Soon</h3>
              <p className="text-sm text-fg-muted">This section is under construction.</p>
            </div>
          )}`;

const renderNew = `          {activeTab === 'created' && (
            <section className="mb-10 sm:mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">My Created Roadmaps</h2>
                <button 
                  onClick={onNavigateToEditor}
                  className="bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Sparkles size={14} /> Create New
                </button>
              </div>
              {myBlueprints.length === 0 ? (
                <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
                  <PenTool className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-fg-default mb-2">You haven't created any roadmaps yet</h3>
                  <p className="text-sm text-fg-muted mb-6">Use the AI generator or build one from scratch.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {myBlueprints.map((bp) => (
                    <div 
                      key={bp.id}
                      className="bg-canvas-surface border border-border-default rounded-lg p-5 shadow-sm hover:border-action-primary transition-all duration-200 cursor-pointer flex flex-col"
                      onClick={() => handleOpenBlueprint(bp.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block px-2 py-1 bg-canvas-inset border border-border-default rounded-sm text-xs font-medium text-fg-muted uppercase tracking-wider mb-2">
                            {bp.domain || 'Technology'}
                          </span>
                          <h3 className="text-base font-semibold text-fg-default leading-tight">{bp.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-fg-muted line-clamp-2 mb-4 flex-1">{bp.description}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-fg-muted border-t border-border-default pt-3">
                        <span className="flex items-center gap-1.5"><BrainCircuit size={14} /> {bp.nodesCount || 0} Nodes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeTab === 'settings' && (
            <div className="bg-canvas-surface border border-border-default rounded-lg p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
              <Settings className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-fg-default mb-2">Settings</h3>
              <p className="text-sm text-fg-muted">Coming Soon</p>
            </div>
          )}`;

code = code.replace(comingSoonOld, renderNew);
fs.writeFileSync(file, code);
