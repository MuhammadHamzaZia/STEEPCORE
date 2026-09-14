import fs from 'fs';

let apiCode = fs.readFileSync('src/services/api.ts', 'utf8');

const targetStr = `  async requestBlueprintAccess(blueprintId: string) {
    return apiClient.post('/api/AccessRequests', { blueprintId });
  },`;

const replaceStr = `  async requestBlueprintAccess(blueprintId: string) {
    return apiClient.post('/api/AccessRequests', { blueprintId });
  },

  // User Progress
  async getUserProgress(blueprintId: string) {
    return apiClient.get(\`/api/UserProgress/\${blueprintId}\`);
  },
  
  async toggleNodeProgress(blueprintId: string, nodeId: string, status: string = 'completed') {
    return apiClient.post('/api/UserProgress/toggle', { blueprintId, nodeId, status });
  },`;

if (apiCode.includes(targetStr)) {
  apiCode = apiCode.replace(targetStr, replaceStr);
  fs.writeFileSync('src/services/api.ts', apiCode);
  console.log("Success: Added progress API");
} else {
  console.log("Failed to find target in api.ts");
}
