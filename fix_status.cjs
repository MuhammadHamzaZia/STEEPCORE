const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/res.status\(503\).json/g, 'res.status(429).json');
// also change the route matching just in case
code = code.replace('app.post("/api/Ai/generate"', 'app.post(["/api/Ai/generate", "/api/ai/generate"])');
code = code.replace('app.post("/api/ai/Chat"', 'app.post(["/api/Ai/Chat", "/api/ai/Chat"])');

fs.writeFileSync('server.ts', code);
