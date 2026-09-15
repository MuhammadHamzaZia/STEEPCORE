import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

content = content.replace(
  "type TabId = 'overview' | 'roadmaps' | 'saved' | 'created';",
  "type TabId = 'overview' | 'roadmaps' | 'saved' | 'created' | 'profile';"
);

content = content.replace(
  "    { id: 'created', label: 'My Created Patterns', icon: <PenTool size={16} /> },\n  ];",
  "    { id: 'created', label: 'My Created Patterns', icon: <PenTool size={16} /> },\n    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },\n  ];"
);

// We need to render the profile section when activeTab === 'profile'
// Currently, DashboardPage has activeTab === 'overview' ...
// Let's find where the overview section is rendered and append the profile section.

const overviewTarget = `          {/* Saved & Created Split View (Overview Only) */}`;

const profileSection = `
          {activeTab === 'profile' && (
            <section className="mb-12 max-w-4xl">
              <div className="bg-canvas-surface border border-border-default rounded-lg p-6 sm:p-8 flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-action-primary text-white flex items-center justify-center font-bold text-3xl shrink-0">
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-fg-default mb-1">{user?.username || 'User Profile'}</h2>
                  <p className="text-fg-muted mb-6">{user?.email}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-canvas-inset border border-border-default rounded-lg p-4">
                      <div className="text-sm text-fg-muted mb-1">Active Roadmaps</div>
                      <div className="text-2xl font-bold text-fg-default">{activeRoadmapsList.length}</div>
                    </div>
                    <div className="bg-canvas-inset border border-border-default rounded-lg p-4">
                      <div className="text-sm text-fg-muted mb-1">Total Progress</div>
                      <div className="text-2xl font-bold text-action-primary">
                        {activeRoadmapsList.length > 0 
                          ? Math.round(activeRoadmapsList.reduce((acc, curr) => acc + curr.progress, 0) / activeRoadmapsList.length) 
                          : 0}%
                      </div>
                    </div>
                    <div className="bg-canvas-inset border border-border-default rounded-lg p-4">
                      <div className="text-sm text-fg-muted mb-1">Saved Items</div>
                      <div className="text-2xl font-bold text-fg-default">{savedBlueprints.length}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-bold text-fg-default mb-4">My Tracking</h3>
                {activeRoadmapsList.length === 0 ? (
                  <div className="bg-canvas-inset border border-border-default rounded-lg p-8 text-center">
                    <p className="text-fg-muted">You haven't started any roadmaps yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRoadmapsList.map(roadmap => {
                      const blueprint = savedBlueprints.find(bp => bp.id === roadmap.id);
                      const title = blueprint?.title || "Custom Roadmap";
                      return (
                        <div key={roadmap.id} className="bg-canvas-surface border border-border-default rounded-lg p-4 flex items-center justify-between hover:border-action-primary transition-colors cursor-pointer" onClick={() => handleOpenBlueprint(roadmap.id)}>
                          <div className="flex-1">
                            <h4 className="font-medium text-fg-default mb-2">{title}</h4>
                            <div className="w-full max-w-md h-1.5 bg-canvas-inset rounded-full overflow-hidden">
                              <div className="h-full bg-action-primary rounded-full" style={{ width: \`\${roadmap.progress}%\` }}></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-fg-default">{roadmap.progress}%</span>
                            <button className="text-action-primary hover:text-action-primary-hover px-3 py-1 bg-action-primary/10 rounded-md text-sm font-medium">Continue</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Saved & Created Split View (Overview Only) */}`;

content = content.replace(overviewTarget, profileSection);

// Also change slice(0, 4) to slice(0, 5) or remove slice if we want all tabs
content = content.replace(/TABS\.slice\(0, 4\)/g, "TABS");
content = content.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, User } from 'lucide-react';");

fs.writeFileSync('src/components/DashboardPage.tsx', content);
