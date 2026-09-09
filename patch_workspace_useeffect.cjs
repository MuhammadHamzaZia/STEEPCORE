const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldUseEffect = `  useEffect(() => {
    if (initialRole) {
      generateRoadmap(initialRole);
    } else if (initialBlueprintId) {
      loadBlueprint(initialBlueprintId);
    }
  }, [initialRole, initialBlueprintId]);`;

const newUseEffect = `  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (initialRole && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateRoadmap(initialRole);
    } else if (initialBlueprintId) {
      loadBlueprint(initialBlueprintId);
    }
  }, [initialRole, initialBlueprintId]);`;

code = code.replace(oldUseEffect, newUseEffect);
fs.writeFileSync(file, code);
