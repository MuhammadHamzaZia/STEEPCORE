import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Currently, the sidebar opens inline causing squishing. Let's make it fixed/overlay on mobile if we want to show it.
// Actually, they specifically requested we fix the mobile UI layout, meaning the sidebar shouldn't push the content out of bounds on mobile, and maybe we want a hamburger menu or overlay.

const target = `{onNavigate && isSidebarOpen && <Sidebar onNavigate={onNavigate} currentPage={currentPage} />}`;
const replacement = `
        {onNavigate && isSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto">
              <Sidebar onNavigate={(page) => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
                onNavigate(page);
              }} currentPage={currentPage} />
            </div>
          </>
        )}
`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Layout.tsx', content);
