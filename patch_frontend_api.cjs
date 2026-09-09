const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace old Node routes with C# Routes

// Chat & Expand
code = code.replace(
    /return apiClient\.post<any>\(`\/api\/Ai\/generate\?_t=\${Date\.now\(\)}`, \{ prompt: params\.prompt \}\);/g,
    `return fetchApi('/api/Ai/generate', { method: 'POST', body: JSON.stringify({ prompt: params.prompt }) });`
);

// We need to patch the mock implementations out and use API calls
const mockBlueprintsReplacement = `  async getBlueprints(domainFilter?: string): Promise<Blueprint[]> {
    try {
      const data = await fetchApi('/api/Blueprints/published');
      if (Array.isArray(data)) {
        let formatted = data.map(item => ({
          ...item,
          id: String(item.id),
          nodesCount: item.nodes?.length || 0,
          creator: { name: item.creatorName || 'STEEPCORE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
        }));
        if (domainFilter && domainFilter !== 'all') {
          formatted = formatted.filter((bp: any) => bp.domain === domainFilter);
        }
        return formatted;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },
  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await fetchApi(\`/api/Blueprints/trending?limit=\${limit}\`);
      return data;
    } catch (e) {
      return [];
    }
  },
  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await fetchApi(\`/api/Blueprints/search?query=\${encodeURIComponent(term)}\`);
      return data;
    } catch (e) {
      return [];
    }
  },
  async getQuickSuggestions(): Promise<string[]> {
    try {
      return await fetchApi('/api/Blueprints/suggestions');
    } catch (e) {
      return ['React', 'Node.js', 'PostgreSQL'];
    }
  },
  async getDomainCounts(): Promise<Record<string, number>> {
    try {
      return await fetchApi('/api/Blueprints/domain-counts');
    } catch (e) {
      return {};
    }
  },
  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await fetchApi(\`/api/Blueprints/\${id}\`);
      if (data) {
        data.nodesCount = data.nodes?.length || 0;
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  },`;

code = code.replace(/async getBlueprints[\s\S]*?async getNodesByBlueprintId/, mockBlueprintsReplacement + '\n  async getNodesByBlueprintId');

const userProgressApi = `  async getUserProgress(blueprintId: string): Promise<any[]> {
    try {
      return await fetchApi(\`/api/UserProgress/\${blueprintId}\`);
    } catch {
      return [];
    }
  },
  async toggleNodeProgress(blueprintId: string, nodeId: string, status: string): Promise<void> {
    await fetchApi('/api/UserProgress/toggle', {
      method: 'POST',
      body: JSON.stringify({ blueprintId, nodeId, status })
    });
  },`;

code = code.replace(/async getUserProgress[\s\S]*?async getUser\(/, userProgressApi + '\n  async getUser(');

fs.writeFileSync(file, code);
