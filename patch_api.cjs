const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

const mapBp = `(bp: any) => ({
  ...bp,
  id: String(bp.id),
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
})`;

code = code.replace(`        let formatted = data.map(item => ({
          ...item,
          id: String(item.id),
          nodesCount: item.nodes?.length || 0,
          creator: { name: item.creatorName || 'STEEPCORE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
        }));`, `        let formatted = data.map(${mapBp});`);

code = code.replace(`  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<Blueprint[]>(\`/api/Blueprints/trending?limit=\${limit}\`);
      return data;`, `  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/trending?limit=\${limit}\`);
      if (Array.isArray(data)) return data.map(${mapBp});
      return [];`);

code = code.replace(`  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<Blueprint[]>(\`/api/Blueprints/search?query=\${encodeURIComponent(term)}\`);
      return data;`, `  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/search?query=\${encodeURIComponent(term)}\`);
      if (Array.isArray(data)) return data.map(${mapBp});
      return [];`);

code = code.replace(`  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await apiClient.get<any>(\`/api/Blueprints/\${id}\`);
      if (data) {
        data.nodesCount = data.nodes?.length || 0;
        return data;`, `  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await apiClient.get<any>(\`/api/Blueprints/\${id}\`);
      if (data) {
        return ${mapBp}(data);`);

fs.writeFileSync(file, code);
