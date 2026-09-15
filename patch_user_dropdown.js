import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `<div className="px-4 py-2 border-b border-[#30363d] text-xs">
                      <p className="font-semibold text-[#e6edf3] truncate">{user.username}</p>
                      <p className="text-[#7d8590] truncate">{user.email}</p>
                    </div>`;

const replacement = `<div className="px-4 py-2 border-b border-[#30363d] text-xs">
                      <p className="font-semibold text-[#e6edf3] truncate">{user.username}</p>
                      <p className="text-[#7d8590] truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onNavigate) {
                          onNavigate('dashboard');
                          // Need a way to set active tab, maybe via useUIStore
                          useUIStore.getState().setActiveTab('roadmaps');
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-[#c9d1d9] hover:bg-[#010409] flex items-center gap-2 text-xs transition-colors"
                    >
                      <Activity size={14} /> My Active Roadmaps
                    </button>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Layout.tsx', content);
