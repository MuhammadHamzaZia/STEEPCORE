import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

const profileSection = `
          {/* User Profile Section */}
          {activeTab === 'profile' && (
            <section className="mb-12 max-w-4xl mx-auto">
              <div className="bg-canvas-surface border border-border-default rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm mb-8">
                <div className="w-24 h-24 rounded-full bg-[#238636] text-white flex items-center justify-center font-bold text-4xl shrink-0 border-4 border-canvas-default shadow-md">
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-fg-default mb-1">{user?.username || 'User Profile'}</h2>
                  <p className="text-fg-muted mb-6">{user?.email}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start">
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5"><BrainCircuit size={14} className="text-action-accent" /> Active Roadmaps</div>
                      <div className="text-2xl font-bold text-fg-default">{activeRoadmapsList.length}</div>
                    </div>
                    <div className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start">
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> Total Progress</div>
                      <div className="text-2xl font-bold text-emerald-500">
                        {activeRoadmapsList.length > 0 
                          ? Math.round(activeRoadmapsList.reduce((acc, curr) => acc + curr.progress, 0) / activeRoadmapsList.length) 
                          : 0}%
                      </div>
                    </div>
                    <div className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start">
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5"><Package size={14} className="text-blue-400" /> Saved Items</div>
                      <div className="text-2xl font-bold text-fg-default">{savedBlueprints.length}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-bold text-fg-default mb-4 flex items-center gap-2"><Activity size={18} className="text-action-primary" /> My Active Progress Tracking</h3>
                {activeRoadmapsList.length === 0 ? (
                  <div className="bg-canvas-surface border border-border-default rounded-lg p-10 text-center shadow-sm">
                    <BrainCircuit className="w-10 h-10 text-fg-muted mx-auto mb-3 opacity-50" />
                    <p className="text-fg-muted mb-4">You haven't started tracking any roadmaps yet.</p>
                    <button 
                      onClick={() => setActiveTab('roadmaps')}
                      className="bg-action-primary hover:bg-action-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Find a Roadmap
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeRoadmapsList.map(roadmap => {
                      const blueprint = savedBlueprints.find(bp => bp.id === roadmap.id);
                      const title = blueprint?.title || "Custom Roadmap";
                      return (
                        <div key={roadmap.id} className="bg-canvas-surface border border-border-default rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-action-primary/50 transition-colors cursor-pointer shadow-sm group" onClick={() => handleOpenBlueprint(roadmap.id)}>
                          <div className="flex-1 w-full">
                            <h4 className="font-semibold text-fg-default mb-2 group-hover:text-action-primary transition-colors">{title}</h4>
                            <div className="w-full max-w-lg h-2 bg-canvas-inset rounded-full overflow-hidden border border-border-default">
                              <div className="h-full bg-action-primary rounded-full relative transition-all duration-500" style={{ width: \`\${roadmap.progress}%\` }}>
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[progress_1s_linear_infinite]"></div>
                              </div>
                            </div>
                            <div className="text-xs text-fg-muted mt-2">{roadmap.completedNodes.length} steps completed</div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 sm:self-center self-end">
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-bold text-fg-default">{roadmap.progress}%</span>
                              <span className="text-xs text-fg-muted">completed</span>
                            </div>
                            <button className="text-white bg-action-primary hover:bg-action-primary-hover px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                              <Play size={14} className="fill-white" />
                              Resume
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}`;

content = content.replace(/        <\/div>\n      <\/main>\n    <\/div>\n  \);\n\}/, profileSection);

content = content.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, Activity } from 'lucide-react';");

fs.writeFileSync('src/components/DashboardPage.tsx', content);
console.log("Profile tab appended!");
