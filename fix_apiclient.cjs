const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

code = code.replace(
  `if (response.status === 503) {`,
  `if (response.status === 503 || response.status === 429) {`
);

fs.writeFileSync('src/services/apiClient.ts', code);
