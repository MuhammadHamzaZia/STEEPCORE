const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

const chatFetchMatch = /const response = await fetch\('\/api\/ai\/Chat', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ messages: \[\.\.\.chatMessages, userMsg\], context: \{ role: initialRole \} \}\),\s*\}\);\s*const data = await response\.json\(\);/g;

code = code.replace(chatFetchMatch, "const data = await apiClient.post<any>('/api/ai/Chat', { messages: [...chatMessages, userMsg], context: { role: initialRole } });");

fs.writeFileSync(file, code);
