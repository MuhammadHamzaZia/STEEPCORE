const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('app.post(["/api/Ai/generate", "/api/ai/generate"]), async', 'app.post(["/api/Ai/generate", "/api/ai/generate"], async');
code = code.replace('app.post(["/api/Ai/Chat", "/api/ai/Chat"]), async', 'app.post(["/api/Ai/Chat", "/api/ai/Chat"], async');

fs.writeFileSync('server.ts', code);
