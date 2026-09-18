const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/res.status\(503\).json/g, 'res.status(429).json');
fs.writeFileSync('server.ts', code);
