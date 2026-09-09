const fs = require('fs');
const file = '/app/applet/src/services/apiClient.ts';
let code = fs.readFileSync(file, 'utf8');

const target = `      let msg = '';
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

const replacement = `      let msg = '';
      if (errData.errors && typeof errData.errors === 'object') {
        if (Array.isArray(errData.errors) && errData.errors.length > 0 && typeof errData.errors[0] === 'object') {
            // Handle ASP.NET Identity errors array [{code: "...", description: "..."}]
            msg = errData.errors.map((e: any) => e.description || JSON.stringify(e)).join(', ');
        } else {
            // Handle standard ASP.NET ModelState errors { Field: ["Error1", "Error2"] }
            msg = Object.values(errData.errors).flat().join(', ');
        }
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
console.log("apiClient.ts patched again");
