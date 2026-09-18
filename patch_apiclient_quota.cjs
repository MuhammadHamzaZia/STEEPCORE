const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

const regex = /if \(err\.message && \(err\.message\.includes\('429'\) \|\| err\.message\.toLowerCase\(\)\.includes\('quota'\) \|\| err\.message\.toLowerCase\(\)\.includes\('rate limit'\)\)\) \{\s*throw new Error\('The AI free generation quota has been exceeded\. Please try again later\.'\);\s*\}/g;

code = code.replace(regex, '');
fs.writeFileSync('src/services/apiClient.ts', code);
