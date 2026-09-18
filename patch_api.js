import fs from 'fs';

let content = fs.readFileSync('src/services/api.ts', 'utf8');

content = content.replace(
  'async requestBlueprintAccess(blueprintId: string) {\n    return apiClient.post(\'/api/AccessRequests\', { blueprintId });',
  'async requestBlueprintAccess(blueprintId: string, creatorId?: string) {\n    return apiClient.post(\'/api/AccessRequests\', { blueprintId, creatorId });'
);

fs.writeFileSync('src/services/api.ts', content);
