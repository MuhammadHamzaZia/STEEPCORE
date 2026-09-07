import { Blueprint, FlowchartNode, UserProgress, User, Transaction } from '../types/schema';
import { blueprints as mockBlueprints, nodes as mockNodes, userProgress, users, transactions } from '../data/mockDatabase';
import { apiClient } from './apiClient';

export const api = {
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
        const formatted: Blueprint[] = data.map((item: any, idx: number) => ({
          id: String(item.id || item.blueprintId || idx + 1),
          title: item.title || item.name || 'Untitled Blueprint',
          slug: item.slug || (item.title ? item.title.toLowerCase().replace(/\s+/g, '-') : 'blueprint'),
          description: item.description || 'System architecture pattern.',
          domain: item.domain || 'Web Architecture',
          price: item.price ?? 0,
          isFree: item.isFree ?? (item.price === 0 || !item.price),
          rating: item.rating ?? 4.8,
          starsCount: item.starsCount || item.stars || 120,
          techStack: Array.isArray(item.techStack) ? item.techStack : (item.tags || ['TypeScript', 'Node.js']),
          creatorId: item.creatorId || 'official',
          source: item.source || 'official',
          isPublished: true,
          version: item.version || '1.0.0',
          allowDataTraining: false,
          nodesCount: Array.isArray(item.nodes) ? item.nodes.length : (item.nodesCount || 8),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          creator: item.creator || { name: 'STEEPCORE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
        }));

        if (domainFilter && domainFilter !== 'all') {
          return formatted.filter(bp => bp.domain === domainFilter);
        }
        return formatted;
      }
    } catch (e) {
      console.warn('Using local fallback for getBlueprints due to remote API state:', e);
    }

    if (domainFilter && domainFilter !== 'all') {
      return mockBlueprints.filter(bp => bp.domain === domainFilter);
    }
    return mockBlueprints;
  },

  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const all = await this.getBlueprints();
      return [...all].sort((a, b) => b.starsCount - a.starsCount).slice(0, limit);
    } catch {
      return [...mockBlueprints].sort((a, b) => b.starsCount - a.starsCount).slice(0, limit);
    }
  },

  async searchBlueprints(term: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(`/api/Blueprints/search?query=${encodeURIComponent(term)}`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any, idx: number) => ({
          id: String(item.id || idx + 1),
          title: item.title || 'SearchResult',
          slug: item.slug || 'search-result',
          description: item.description || '',
          domain: item.domain || 'General',
          price: item.price ?? 0,
          isFree: item.isFree ?? true,
          rating: item.rating ?? 4.5,
          starsCount: item.starsCount ?? 50,
          techStack: item.techStack || ['AI', 'API'],
          creatorId: 'official',
          source: 'official',
          isPublished: true,
          version: '1.0.0',
          allowDataTraining: false,
          nodesCount: item.nodesCount || 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: { name: 'STEEPCORE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
        }));
      }
    } catch (e) {
      console.warn('Search fallback to client filter');
    }

    const all = await this.getBlueprints();
    const q = term.toLowerCase();
    return all.filter(bp => bp.title.toLowerCase().includes(q) || bp.description.toLowerCase().includes(q));
  },

  async getQuickSuggestions(): Promise<string[]> {
    const all = await this.getBlueprints();
    const tagCounts: Record<string, number> = {};
    all.forEach(bp => {
      bp.techStack?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const suggestions = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);

    return suggestions.length > 0 ? suggestions : ['Microservices', 'RAG Pipeline', 'PostgreSQL', 'FastAPI', 'Kubernetes', 'GraphQL'];
  },

  async getDomainCounts(): Promise<Record<string, number>> {
    const all = await this.getBlueprints();
    const counts: Record<string, number> = {};
    all.forEach(bp => {
      counts[bp.domain] = (counts[bp.domain] || 0) + 1;
    });
    return counts;
  },

  async getBlueprintById(id: string): Promise<Blueprint | undefined> {
    try {
      const data = await apiClient.get<any>(`/api/Blueprints/${id}`);
      if (data && data.id) {
        return {
          id: String(data.id),
          title: data.title || 'Blueprint Detail',
          slug: data.slug || 'blueprint-detail',
          description: data.description || '',
          domain: data.domain || 'Web Architecture',
          price: data.price ?? 0,
          isFree: data.isFree ?? true,
          rating: data.rating ?? 4.8,
          starsCount: data.starsCount ?? 150,
          techStack: data.techStack || ['System Architecture'],
          creatorId: data.creatorId || 'official',
          source: data.source || 'official',
          isPublished: true,
          version: data.version || '1.0.0',
          allowDataTraining: false,
          nodesCount: Array.isArray(data.nodes) ? data.nodes.length : 8,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          creator: data.creator || { name: 'STEEPCORE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
        };
      }
    } catch (e) {
      console.warn(`Blueprint ${id} remote fetch failed, trying mock:`, e);
    }
    return mockBlueprints.find(bp => bp.id === id);
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
          position: n.position || { x: (idx % 3) * 220 + 50, y: Math.floor(idx / 3) * 150 + 50 },
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
  async generateAiBlueprint(params: { prompt: string; topic?: string; targetRole?: string; level?: string }) {
    try {
      const res = await apiClient.post<any>('/api/Ai/generate', params);
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
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return userProgress.filter(up => up.userId === userId);
  },

  async getBlueprintProgress(userId: string, blueprintId: string): Promise<UserProgress | undefined> {
    return userProgress.find(up => up.userId === userId && up.blueprintId === blueprintId);
  },
  
  async getUser(id: string): Promise<User | undefined> {
    return users.find(u => u.id === id);
  },
  
  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return transactions.filter(t => t.buyerId === userId || t.creatorId === userId);
  }
};
