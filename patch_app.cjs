const fs = require('fs');
const file = '/app/applet/src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace imports
code = code.replace(/import \{ RoadmapGenerator \} from '\.\/components\/RoadmapGenerator';\nimport \{ LandingPage \} from '\.\/components\/LandingPage';\nimport \{ CatalogPage \} from '\.\/components\/CatalogPage';\nimport \{ ProductDetailPage \} from '\.\/components\/ProductDetailPage';\nimport \{ EditorPage \} from '\.\/components\/EditorPage';/, 
`import { RoadmapWorkspace } from './components/RoadmapWorkspace';
import { LandingPage } from './components/LandingPage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { DashboardPage } from './components/DashboardPage';`);

// In case EditorPage and DashboardPage are imported differently
code = code.replace(/import \{ EditorPage \} from '\.\/components\/EditorPage';/, '');
code = code.replace(/import \{ RoadmapGenerator \} from '\.\/components\/RoadmapGenerator';/, '');

// Replace EditorPage return block
code = code.replace(/if \(currentPage === 'editor'\) \{\n    return <EditorPage onBack=\{\(\) => setCurrentPage\('product'\)\} \/>;\n  \}/, 
  `if (currentPage === 'editor') {
    return <RoadmapWorkspace initialBlueprintId={useUIStore().selectedBlueprintId || undefined} onBack={() => setCurrentPage('product')} />;
  }`);

// Replace RoadmapGenerator block
code = code.replace(/\{currentPage === 'roadmap' && selectedRole && \(\n          <RoadmapGenerator initialRole=\{selectedRole\} onBack=\{handleBackToLanding\} \/>\n        \)\}/, 
  `{currentPage === 'roadmap' && selectedRole && (
          <RoadmapWorkspace initialRole={selectedRole} onBack={handleBackToLanding} />
        )}`);

fs.writeFileSync(file, code);
console.log("App.tsx patched");
