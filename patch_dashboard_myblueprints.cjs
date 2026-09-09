const fs = require('fs');
const file = '/app/applet/src/components/DashboardPage.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldFetch = `    const fetchSavedData = async () => {
      setIsLoading(true);
      try {
        const allBlueprints = await api.getBlueprints();
        const saved = allBlueprints.filter(bp => savedBlueprintIds.includes(bp.id));
        setSavedBlueprints(saved);
      } catch (error) {
        console.error("Failed to fetch saved blueprints:", error);
      } finally {
        setIsLoading(false);
      }
    };`;

const newFetch = `    const fetchSavedData = async () => {
      setIsLoading(true);
      try {
        const allBlueprints = await api.getBlueprints();
        const saved = allBlueprints.filter(bp => savedBlueprintIds.includes(bp.id));
        setSavedBlueprints(saved);
        
        try {
            const my = await api.getMyBlueprints();
            setMyBlueprints(my);
        } catch (authErr) {
            console.log('Not logged in or error fetching my blueprints', authErr);
        }
      } catch (error) {
        console.error("Failed to fetch saved blueprints:", error);
      } finally {
        setIsLoading(false);
      }
    };`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync(file, code);
