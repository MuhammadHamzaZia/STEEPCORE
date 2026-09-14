import { Blueprint, FlowchartNode, UserProgress, User, Transaction } from '../types/schema';
import { apiClient } from './apiClient';

export const api = {
  getMyBlueprints: async (): Promise<Blueprint[]> => {
    return apiClient.get<Blueprint[]>('/api/blueprints/me');
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
      if (Array.isArray(data)) {
        let formatted = data.map(item => ({
          ...item,
          id: String(item.id),
          nodesCount: item.nodes?.length || 0,
          creator: { name: item.creatorName || 'STEEPCORE' }
        })).map(bp => ({
          ...bp,
          price: (bp.creator.name === 'STEEPCORE' || bp.creator.name === 'System' || bp.creator.name === 'Unknown') ? 0 : bp.price
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
      const data = await apiClient.get<any[]>(`/api/Blueprints/trending?limit=${limit}`);
      return data.map(bp => ({
        ...bp,
        price: (bp.creatorName === 'STEEPCORE' || bp.creatorName === 'System' || bp.creatorName === 'Unknown' || !bp.creatorName) ? 0 : bp.price
      }));
    } catch (e) {
      return [];
    }
  },
  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      return await apiClient.get<Blueprint[]>(`/api/Blueprints/search?query=${encodeURIComponent(term)}`);
    } catch (e) {
      return [];
    }
  },
  async getQuickSuggestions(): Promise<string[]> {
    try {
      return await apiClient.get<string[]>('/api/Blueprints/suggestions');
    } catch (e) {
      return [];
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
      if (data) {
        data.nodesCount = data.nodes?.length || 0;
        data.creator = { name: data.creatorName || 'STEEPCORE' };
        if (data.creator.name === 'STEEPCORE' || data.creator.name === 'System' || data.creator.name === 'Unknown') {
          data.price = 0;
        }
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
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
      console.error(e);
    }
    return [];
  },

  // AI Generation
  async generateAiBlueprint(params: { prompt: string }) {
    try {
      const res = await apiClient.post<any>(`/api/Ai/generate?_t=${Date.now()}`, { prompt: params.prompt });
      return res;
    } catch (error: any) {
      console.warn('Live AI endpoint returned error or unavailable:', error);
      throw error;
    }
  },

  // CRUD Blueprints
  async createBlueprint(payload: { title: string; description: string; domain?: string; nodes?: any[]; edges?: any[] }) {
    return apiClient.post('/api/Blueprints', payload);
  },

  async updateBlueprint(id: string, payload: any) {
    return apiClient.put(`/api/Blueprints/${id}`, payload);
  },

  async deleteBlueprint(id: string) {
    return apiClient.delete(`/api/Blueprints/${id}`);
  },

  async requestBlueprintAccess(blueprintId: string) {
    return apiClient.post('/api/AccessRequests', { blueprintId });
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
  }
};
