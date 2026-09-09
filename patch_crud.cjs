const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `  async createBlueprint(payload: { title: string; description: string; domain?: string; nodes?: any[]; edges?: any[] }) {
    return apiClient.post('/api/Blueprints', payload);
  },`,
  `  async createBlueprint(payload: { title: string; description: string; domain?: string; nodes?: any[]; edges?: any[] }) {
    try {
      return await apiClient.post('/api/Blueprints', payload);
    } catch (e) {
      const newBp = {
        id: 'mock-' + Date.now(),
        title: payload.title,
        slug: payload.title.toLowerCase().replace(/\\s+/g, '-'),
        description: payload.description,
        domain: payload.domain || 'other',
        price: 0,
        isFree: true,
        rating: 5.0,
        starsCount: 0,
        techStack: [],
        creatorId: 'user-1',
        source: 'community',
        isPublished: true,
        version: '1.0.0',
        allowDataTraining: true,
        nodesCount: payload.nodes?.length || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { name: 'Local User', avatar: 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=100&q=80' }
      };
      mockBlueprints.unshift(newBp);
      if (payload.nodes) {
        payload.nodes.forEach(n => mockNodes.push({ ...n, blueprintId: newBp.id }));
      }
      return { id: newBp.id };
    }
  },`
);

code = code.replace(
  `  async updateBlueprint(id: string, payload: any) {
    return apiClient.put(\`/api/Blueprints/\${id}\`, payload);
  },`,
  `  async updateBlueprint(id: string, payload: any) {
    try {
      return await apiClient.put(\`/api/Blueprints/\${id}\`, payload);
    } catch (e) {
      const idx = mockBlueprints.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) {
        mockBlueprints[idx] = { ...mockBlueprints[idx], ...payload, updatedAt: new Date().toISOString() };
      }
      return { success: true };
    }
  },`
);

code = code.replace(
  `  async deleteBlueprint(id: string) {
    return apiClient.delete(\`/api/Blueprints/\${id}\`);
  },`,
  `  async deleteBlueprint(id: string) {
    try {
      return await apiClient.delete(\`/api/Blueprints/\${id}\`);
    } catch (e) {
      const idx = mockBlueprints.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) mockBlueprints.splice(idx, 1);
      return { success: true };
    }
  },`
);

fs.writeFileSync(file, code);
