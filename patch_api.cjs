const fs = require('fs');
const file = '/app/applet/src/services/apiClient.ts';
let code = fs.readFileSync(file, 'utf8');

const target = `    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg =
        (errData.error && typeof errData.error.message === 'string' && errData.error.message) ||
        (typeof errData.message === 'string' && errData.message) ||
        (typeof errData.error === 'string' && errData.error) ||
        (typeof errData.title === 'string' && errData.title) ||
        \`Request failed with status \${response.status} at \${url}\`;`;

const replacement = `    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      
      let msg = '';
      if (errData.errors && typeof errData.errors === 'object') {
        // Flatten ASP.NET Core model validation errors nicely
        msg = Object.values(errData.errors).flat().join(', ');
      } else {
        msg =
          (errData.error && typeof errData.error.message === 'string' && errData.error.message) ||
          (typeof errData.message === 'string' && errData.message) ||
          (typeof errData.error === 'string' && errData.error) ||
          (typeof errData.title === 'string' && errData.title) ||
          \`Request failed with status \${response.status}\`;
      }`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
console.log("apiClient.ts patched");
