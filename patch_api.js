import fs from 'fs';

let code = fs.readFileSync('src/services/api.ts', 'utf8');

code = code.replace(
  /async getBlueprints\(domainFilter\?: string\): Promise<Blueprint\[\]> \{[\s\S]*?const data = await apiClient\.get<any\[\]>\('\/api\/Blueprints\/published'\);/,
  "async getBlueprints(page: number = 1, pageSize: number = 12, domainFilter?: string): Promise<Blueprint[]> {\n    try {\n      const data = await apiClient.get<any[]>(`/api/Blueprints/published?page=${page}&pageSize=${pageSize}`);"
);

fs.writeFileSync('src/services/api.ts', code);
console.log('patched api');
