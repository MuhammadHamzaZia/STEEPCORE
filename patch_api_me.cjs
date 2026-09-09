const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

const mapBp = `(bp: any) => ({
  ...bp,
  id: String(bp.id),
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
})`;

code = code.replace(`  getMyBlueprints: async (): Promise<Blueprint[]> => {
    return apiClient.get<Blueprint[]>('/api/blueprints/me');
  },`, `  getMyBlueprints: async (): Promise<Blueprint[]> => {
    const data = await apiClient.get<any[]>('/api/blueprints/me');
    if (Array.isArray(data)) return data.map(${mapBp});
    return [];
  },`);

fs.writeFileSync(file, code);
