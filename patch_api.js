import fs from 'fs';

let code = fs.readFileSync('src/services/api.ts', 'utf8');

const target = `  // Checkout Module`;
const replace = `  async requestBlueprintAccess(blueprintId: string) {
    return apiClient.post('/api/AccessRequests', { blueprintId });
  },

  // Checkout Module`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/services/api.ts', code);
  console.log("Success");
} else {
  console.log("Not found");
}
