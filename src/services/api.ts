import { Blueprint, FlowchartNode, UserProgress, User, Transaction } from '../types/schema';
import { blueprints as mockBlueprints, nodes as mockNodes, userProgress, users, transactions } from '../data/mockDatabase';
import { apiClient } from './apiClient';

export const api = {
  getMyBlueprints: async (): Promise<Blueprint[]> => {
    try {
      const data = await apiClient.get<any[]>('/api/blueprints/me');
      if (Array.isArray(data) && data.length > 0) return data.map((bp: any) => ({
  ...bp,
  id: String(bp.id),
  rating: bp.rating || 0,
  starsCount: bp.starsCount || 0,
  price: bp.price || 0,
  techStack: bp.techStack || [],
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
}));
    } catch (e) {}
    return mockBlueprints.filter(b => b.creatorId === 'user-1');
  },
  // System Health
  async checkHealth(): Promise<{ status: string }> {
    try {
      const res = await apiClient.get<{ status?: string }>('/health');
      return { status: res.status || 'ok' };
    } catch {
      try {
        const res2 = await apiClient.get<{ status?: string }>('/health/ready');
        return { status: res2.status || 'ready' };
      } catch {
        return { status: 'offline' };
      }
    }
  },

  // Auth helper alias
  async login(emailOrUsername: string, password: string) {
    return apiClient.post('/api/Auth/login', { email: emailOrUsername, username: emailOrUsername, password });
  },

  async register(username: string, email: string, password: string) {
    return apiClient.post('/api/Auth/register', { username, email, password });
  },

  // Blueprints
    async getBlueprints(domainFilter?: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>('/api/Blueprints/published');
      if (Array.isArray(data) && data.length > 0) {
        let formatted = data.map((bp: any) => ({
  ...bp,
  id: String(bp.id),
  rating: bp.rating || 0,
  starsCount: bp.starsCount || 0,
  price: bp.price || 0,
  techStack: bp.techStack || [],
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
}));
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
  },
  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(`/api/Blueprints/trending?limit=${limit}`);
      if (Array.isArray(data) && data.length > 0) return data.map((bp: any) => ({
  ...bp,
  id: String(bp.id),
  rating: bp.rating || 0,
  starsCount: bp.starsCount || 0,
  price: bp.price || 0,
  techStack: bp.techStack || [],
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
}));
    } catch (e) {}
    return [...mockBlueprints].sort((a, b) => b.starsCount - a.starsCount).slice(0, limit);
  },
  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(`/api/Blueprints/search?query=${encodeURIComponent(term)}`);
      if (Array.isArray(data) && data.length > 0) return data.map((bp: any) => ({
  ...bp,
  id: String(bp.id),
  rating: bp.rating || 0,
  starsCount: bp.starsCount || 0,
  price: bp.price || 0,
  techStack: bp.techStack || [],
  nodesCount: bp.nodes?.length || 0,
  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
}));
    } catch (e) {}
    const q = term.toLowerCase();
    return mockBlueprints.filter(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || (b.techStack || []).some(t => t.toLowerCase().includes(q)));
  },
  async getQuickSuggestions(): Promise<string[]> {
    try {
      return await apiClient.get<string[]>('/api/Blueprints/suggestions');
    } catch (e) {
      return ['React', 'Node.js', 'PostgreSQL'];
    }
  },
  async getDomainCounts(): Promise<Record<string, number>> {
    try {
      return await apiClient.get<Record<string, number>>('/api/Blueprints/domain-counts');
    } catch (e) {
      return {};
    }
  },
  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await apiClient.get<any>(`/api/Blueprints/${id}`);
      if (data && data.id) {
        const formatted = { ...data, id: String(data.id), rating: data.rating || 0, starsCount: data.starsCount || 0, price: data.price || 0, techStack: data.techStack || [], nodesCount: data.nodes?.length || 0, creator: { name: data.creatorName || data.creator?.name || 'STEEPCORE', avatar: data.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' } };
        return formatted;
      }
    } catch (e) {
      console.error('Failed to fetch blueprint by id, using dummy data.');
    }
    return mockBlueprints.find(b => String(b.id) === String(id));
  },
  async getNodesByBlueprintId(blueprintId: string): Promise<FlowchartNode[]> {
    try {
      const data = await apiClient.get<any>(`/api/Blueprints/${blueprintId}`);
      if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        return data.nodes.map((n: any, idx: number) => ({
          id: String(n.id || `node-${idx}`),
          blueprintId,
          label: n.title || n.label || n.name || `Step ${idx + 1}`,
          description: n.description || '',
          type: n.type || 'task',
          status: n.status || 'pending',
          codeSnippet: n.codeSnippet || n.code || '',
          position: (n.positionX !== undefined && n.positionY !== undefined && (n.positionX !== 0 || n.positionY !== 0))
            ? { x: n.positionX, y: n.positionY }
            : (n.position || { x: (idx % 3) * 220 + 50, y: Math.floor(idx / 3) * 150 + 50 }),
          isAiGenerated: !!n.isAiGenerated,
          allowDataTraining: false
        }));
      }
    } catch (e) {
      console.warn('Fallback nodes to mockDatabase');
    }
    return mockNodes.filter(n => n.blueprintId === blueprintId);
  },

  // AI Generation
  async generateAiBlueprint(params: { prompt: string }) {
    try {
      const res = await apiClient.post<any>(`/api/Ai/generate?_t=${Date.now()}`, { prompt: params.prompt });
      if (res && res.nodes) return res;
      throw new Error('Fallback to dummy data');
    } catch (error: any) {
      console.warn('Live AI endpoint returned error or unavailable, using dummy data.');
      return {
        nodes: [
          { id: 'n1', title: 'Start: ' + params.prompt, type: 'topic', positionX: 250, positionY: 100 },
          { id: 'n2', title: 'Phase 1 Research', type: 'task', positionX: 100, positionY: 250 },
          { id: 'n3', title: 'Phase 1 Implementation', type: 'task', positionX: 400, positionY: 250 }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e1-2', source: 'n1', target: 'n3' }
        ]
      };
    }
  },

  // CRUD Blueprints
  async createBlueprint(payload: { title: string; description: string; domain?: string; nodes?: any[]; edges?: any[] }) {
    try {
      return await apiClient.post('/api/Blueprints', payload);
    } catch (e) {
      const newBp = {
        id: 'mock-' + Date.now(),
        title: payload.title,
        slug: payload.title.toLowerCase().replace(/\s+/g, '-'),
        description: payload.description,
        domain: payload.domain || 'other',
        price: 0,
        isFree: true,
        rating: 5.0,
        starsCount: 0,
        techStack: [],
        creatorId: 'user-1',
        source: 'community' as any,
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
  },

  async updateBlueprint(id: string, payload: any) {
    try {
      return await apiClient.put(`/api/Blueprints/${id}`, payload);
    } catch (e) {
      const idx = mockBlueprints.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) {
        mockBlueprints[idx] = { ...mockBlueprints[idx], ...payload, updatedAt: new Date().toISOString() };
      }
      return { success: true };
    }
  },

  async deleteBlueprint(id: string) {
    try {
      return await apiClient.delete(`/api/Blueprints/${id}`);
    } catch (e) {
      const idx = mockBlueprints.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) mockBlueprints.splice(idx, 1);
      return { success: true };
    }
  },

  // Checkout Module
  async createCheckoutSession(blueprintId: string, planId?: string) {
    return apiClient.post<{ checkoutUrl?: string; sessionId?: string }>('/api/Checkout/session', {
      blueprintId,
      planId,
      returnUrl: window.location.href,
    });
  },

  async confirmCheckout(paymentId: string, sessionId?: string) {
    return apiClient.post('/api/Checkout/confirm', { paymentId, sessionId });
  },

  // User & Transactions
    async getUserProgress(blueprintId: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`/api/UserProgress/${blueprintId}`);
    } catch {
      return [];
    }
  },
  async toggleNodeProgress(blueprintId: string, nodeId: string, status: string): Promise<void> {
    await apiClient.post('/api/UserProgress/toggle', { blueprintId, nodeId, status });
  },
  async getUser(id: string): Promise<User | undefined> {
    return users.find(u => u.id === id);
  },
  
  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return transactions.filter(t => t.buyerId === userId || t.creatorId === userId);
  }
};
