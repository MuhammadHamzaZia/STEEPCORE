import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `<div className="px-4 py-2 border-b border-[#30363d] text-xs">
                      <p className="font-semibold text-[#e6edf3] truncate">{user.username}</p>
                      <p className="text-[#7d8590] truncate">{user.email}</p>
                    </div>`;

const replacement = `<div 
                      className="px-4 py-3 border-b border-[#30363d] text-xs cursor-pointer hover:bg-[#010409] transition-colors"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onNavigate) {
                          onNavigate('dashboard');
                          useUIStore.getState().setActiveTab('profile');
                        }
                      }}
                    >
                      <p className="font-semibold text-[#e6edf3] truncate">{user.username}</p>
                      <p className="text-[#7d8590] truncate">{user.email}</p>
                      <div className="mt-2 text-action-primary font-medium flex items-center gap-1">View Profile & Progress <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                    </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Layout.tsx', content);
