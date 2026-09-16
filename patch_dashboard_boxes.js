import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

// Replace the static boxes with clickable ones.
const targetBox1 = `<div className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start">
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5"><BrainCircuit size={14} className="text-action-accent" /> Active Roadmaps</div>
                      <div className="text-2xl font-bold text-fg-default">{activeRoadmapsList.length}</div>
                    </div>`;

const replaceBox1 = `<div 
                      onClick={() => setActiveTab('roadmaps')}
                      className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start cursor-pointer hover:border-action-primary/50 transition-colors group"
                    >
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5 group-hover:text-action-primary transition-colors"><BrainCircuit size={14} className="text-action-accent" /> Active Roadmaps</div>
                      <div className="text-2xl font-bold text-fg-default">{activeRoadmapsList.length}</div>
                    </div>`;

const targetBox3 = `<div className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start">
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5"><Package size={14} className="text-blue-400" /> Saved Items</div>
                      <div className="text-2xl font-bold text-fg-default">{savedBlueprints.length}</div>
                    </div>`;

const replaceBox3 = `<div 
                      onClick={() => setActiveTab('saved')}
                      className="bg-canvas-inset border border-border-default rounded-lg p-4 shadow-sm flex flex-col items-center md:items-start cursor-pointer hover:border-blue-400/50 transition-colors group"
                    >
                      <div className="text-sm text-fg-muted mb-1 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors"><Package size={14} className="text-blue-400" /> Saved Items</div>
                      <div className="text-2xl font-bold text-fg-default">{savedBlueprints.length}</div>
                    </div>`;

content = content.replace(targetBox1, replaceBox1);
content = content.replace(targetBox3, replaceBox3);

fs.writeFileSync('src/components/DashboardPage.tsx', content);
