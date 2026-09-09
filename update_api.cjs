const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

const mapBp = `(bp: any) => ({
  ...bp,
  id: String(bp.id),
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
})`;

code = code.replace(
  `  getMyBlueprints: async (): Promise<Blueprint[]> => {
    const data = await apiClient.get<any[]>('/api/blueprints/me');
    if (Array.isArray(data)) return data.map(${mapBp});
    return [];
  },`,
  `  getMyBlueprints: async (): Promise<Blueprint[]> => {
    try {
      const data = await apiClient.get<any[]>('/api/blueprints/me');
      if (Array.isArray(data) && data.length > 0) return data.map(${mapBp});
    } catch (e) {}
    return mockBlueprints.filter(b => b.creatorId === 'user-1');
  },`
);

code = code.replace(
  `  async getBlueprints(domainFilter?: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>('/api/Blueprints/published');
      if (Array.isArray(data)) {
        let formatted = data.map(${mapBp});
        if (domainFilter && domainFilter !== 'all') {
          formatted = formatted.filter((bp: any) => bp.domain === domainFilter);
        }
        return formatted;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },`,
  `  async getBlueprints(domainFilter?: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>('/api/Blueprints/published');
      if (Array.isArray(data) && data.length > 0) {
        let formatted = data.map(${mapBp});
        if (domainFilter && domainFilter !== 'all') {
          formatted = formatted.filter((bp: any) => bp.domain === domainFilter);
        }
        return formatted;
      }
    } catch (e) {
      console.error('Failed to fetch blueprints, using dummy data.');
    }
    let fallback = mockBlueprints;
    if (domainFilter && domainFilter !== 'all') {
      fallback = fallback.filter((bp: any) => bp.domain === domainFilter);
    }
    return fallback;
  },`
);

code = code.replace(
  `  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/trending?limit=\${limit}\`);
      if (Array.isArray(data)) return data.map(${mapBp});
      return [];
    } catch (e) {
      return [];
    }
  },`,
  `  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/trending?limit=\${limit}\`);
      if (Array.isArray(data) && data.length > 0) return data.map(${mapBp});
    } catch (e) {}
    return [...mockBlueprints].sort((a, b) => b.starsCount - a.starsCount).slice(0, limit);
  },`
);

code = code.replace(
  `  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/search?query=\${encodeURIComponent(term)}\`);
      if (Array.isArray(data)) return data.map(${mapBp});
      return [];
    } catch (e) {
      return [];
    }
  },`,
  `  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/search?query=\${encodeURIComponent(term)}\`);
      if (Array.isArray(data) && data.length > 0) return data.map(${mapBp});
    } catch (e) {}
    const q = term.toLowerCase();
    return mockBlueprints.filter(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || (b.techStack || []).some(t => t.toLowerCase().includes(q)));
  },`
);

code = code.replace(
  `  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await apiClient.get<any>(\`/api/Blueprints/\${id}\`);
      if (data) {
        const formatted = { ...data, id: String(data.id), nodesCount: data.nodes?.length || 0, creator: { name: data.creatorName || data.creator?.name || 'STEEPCORE', avatar: data.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' } };
        return formatted;
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  },`,
  `  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await apiClient.get<any>(\`/api/Blueprints/\${id}\`);
      if (data && data.id) {
        const formatted = { ...data, id: String(data.id), nodesCount: data.nodes?.length || 0, creator: { name: data.creatorName || data.creator?.name || 'STEEPCORE', avatar: data.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' } };
        return formatted;
      }
    } catch (e) {
      console.error('Failed to fetch blueprint by id, using dummy data.');
    }
    return mockBlueprints.find(b => String(b.id) === String(id));
  },`
);

fs.writeFileSync(file, code);
