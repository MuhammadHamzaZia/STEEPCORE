const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "source: 'community',",
  "source: 'community' as any,"
);
fs.writeFileSync(file, code);
