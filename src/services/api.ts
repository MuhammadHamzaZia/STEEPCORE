import { Blueprint, FlowchartNode, UserProgress, User, Transaction } from '../types/schema';
import { apiClient } from './apiClient';


const _FALLBACK_PROMPTS = [
  "Build a scalable microservices architecture in Go",
  "Design an event-driven architecture using Kafka",
  "How to become a Senior Frontend Engineer",
  "Learning roadmap for Rust programming",
  "Full-stack Web3 and Blockchain developer guide",
  "Step-by-step guide to becoming a Data Scientist",
  "Architect a highly available Cloud-native app on AWS",
  "Mastering Kubernetes and Container Orchestration",
  "Roadmap to passing the AWS Solutions Architect exam",
  "How to build an AI chatbot using LLMs and RAG",
  "Design a real-time multiplayer game server",
  "Learning path for a UX/UI Product Designer",
  "Complete guide to becoming a DevOps Engineer",
  "How to build your own custom mechanical keyboard",
  "Roadmap to becoming a certified Welder",
  "Step-by-step guide to building a tiny house",
  "How to start a successful podcast from scratch",
  "Learning path for a professional Video Editor",
  "Mastering AutoCAD for Civil Engineering",
  "How to design a sustainable eco-friendly home",
  "Roadmap for a career in Cyber Security",
  "Guide to becoming a licensed Electrician",
  "Learning path for a 3D Modeler & Animator",
  "How to restore a classic muscle car",
  "Step-by-step guide to writing a novel",
  "Roadmap to becoming a professional Chef",
  "How to build a SaaS startup as a solo founder",
  "Learning path for a Financial Analyst",
  "Guide to starting a dropshipping e-commerce business",
  "Mastering SEO and Digital Marketing",
  "How to create a viral social media campaign",
  "Roadmap to becoming a Registered Nurse",
  "Guide to passing the CPA exam",
  "How to brew your own craft beer at home",
  "Learning path for a Real Estate Agent",
  "Step-by-step guide to creating a graphic novel",
  "Roadmap for becoming an Airline Pilot",
  "How to build a smart home automation system",
  "Guide to urban farming and hydroponics",
  "Learning path for a Fitness Personal Trainer",
  "Roadmap to becoming a freelance Copywriter",
  "How to plan and launch a Kickstarter campaign",
  "Mastering machine learning with Python",
  "Guide to becoming a professional Photographer",
  "How to build a high-performance gaming PC",
  "Roadmap for a career in Game Development",
  "Learning path for an iOS Swift Developer",
  "Guide to becoming a commercial Drone Pilot",
  "How to start a food truck business",
  "Roadmap for becoming a Yoga Instructor",
  "Mastering public speaking and presentations",
  "Guide to investing in cryptocurrency",
  "How to build a personal brand on LinkedIn",
  "Roadmap for becoming a Product Manager",
  "Learning path for a Database Administrator",
  "Guide to creating a successful YouTube channel",
  "How to start a sustainable clothing brand",
  "Roadmap to becoming a Sommelier",
  "Mastering prompt engineering for AI models",
  "Guide to becoming a licensed Plumber",
  "How to write and direct a short film",
  "Roadmap for a career in Renewable Energy",
  "Learning path for a Quantum Computing researcher",
  "Guide to becoming a professional eSports gamer",
  "How to start a nonprofit organization",
  "Roadmap to becoming an Interior Designer",
  "Mastering the art of woodworking and carpentry",
  "Guide to becoming a successful day trader",
  "How to build a mobile app in React Native",
  "Roadmap for a career in Biomedical Engineering",
  "Learning path for a 2D Concept Artist",
  "Guide to becoming a Travel Blogger",
  "How to start a wedding planning business",
  "Roadmap to becoming a Veterinary Technician",
  "Mastering digital music production (Ableton)",
  "Guide to becoming a certified Scuba Instructor",
  "How to build a solar-powered generator",
  "Roadmap for a career in Marine Biology",
  "Learning path for an Agile Scrum Master",
  "Guide to becoming a professional Makeup Artist",
  "How to publish a board game",
  "Roadmap to becoming a Voice Over Actor",
  "Mastering the art of pottery and ceramics",
  "Guide to becoming a Private Investigator",
  "How to start a pet grooming business",
  "Roadmap for a career in Aerospace Engineering",
  "Learning path for a Technical Writer",
  "Guide to becoming a certified translator",
  "How to build a successful Patreon community",
  "Roadmap to becoming a Landscape Architect",
  "Mastering foreign exchange (Forex) trading",
  "Guide to becoming a professional DJ",
  "How to start a successful baking business",
  "Roadmap for a career in Artificial Intelligence",
  "Learning path for a CNC Machinist",
  "Guide to becoming an Event Planner",
  "How to build a community garden",
  "Roadmap to becoming a Blockchain Auditor",
  "Mastering negotiation and sales techniques",
  "Guide to becoming a professional Astrologer",
  "How to start a boutique coffee shop",
  "Roadmap for a career in Music Therapy"
];

export const api = {

  async getCategories(): Promise<{name: string, label: string}[]> {
    try {
      const res = await apiClient.get<{name: string, label: string}[]>('/api/Taxonomy/categories');
      if (res && res.length > 0) return res;
      throw new Error('fallback');
    } catch {
      return [
        { name: 'all', label: 'All Categories' },
        { name: 'Role-Based', label: 'Role-Based Paths' },
        { name: 'Skill-Based', label: 'Skill-Based Guides' },
        { name: 'Project-Based', label: 'Project-Based Guides' },
      ];
    }
  },
  async getIndustries(): Promise<{name: string, label: string}[]> {
    try {
      const res = await apiClient.get<{name: string, label: string}[]>('/api/Taxonomy/industries');
      if (res && res.length > 0) return res;
      throw new Error('fallback');
    } catch {
      return [
        { name: 'all', label: 'All Industries' },
        { name: 'IT & Software', label: 'IT & Software' },
        { name: 'Construction', label: 'Construction & Architecture' },
        { name: 'Automotive', label: 'Automotive & Mechanics' },
        { name: 'Healthcare', label: 'Healthcare & Medical' },
        { name: 'Business', label: 'Business & Finance' },
        { name: 'Creative', label: 'Creative & Design' },
      ];
    }
  },
  async getDomains(): Promise<{name: string, label: string}[]> {
    try {
      const res = await apiClient.get<{name: string, label: string}[]>('/api/Taxonomy/domains');
      if (res && res.length > 0) return res;
      throw new Error('fallback');
    } catch {
      return [
        { name: 'all', label: 'All Domains' },
        { name: 'AI & Data Science', label: 'AI & Data Science' },
        { name: 'Web & Mobile', label: 'Web & Mobile Dev' },
        { name: 'Cloud & DevOps', label: 'Cloud & DevOps' },
        { name: 'Core Engineering', label: 'Core Engineering' },
        { name: 'Other', label: 'Other' }
      ];
    }
  },


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
  async getBlueprints(page: number = 1, pageSize: number = 20, domainFilter?: string): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(`/api/Blueprints/published?pageNumber=${page}&pageSize=${pageSize}`);
      if (Array.isArray(data)) {
        let formatted = data.map(item => ({
          ...item,
          id: String(item.id),
          nodesCount: (item.nodesCount !== undefined && item.nodesCount !== null) ? item.nodesCount : (item.nodes?.length || 0),
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
      if (Array.isArray(data)) {
        return data.map(bp => ({
          ...bp,
          id: String(bp.id),
          nodesCount: (bp.nodesCount !== undefined && bp.nodesCount !== null) ? bp.nodesCount : (bp.nodes?.length || 0),
          creator: { name: bp.creatorName || 'STEEPCORE' },
          price: (bp.creatorName === 'STEEPCORE' || bp.creatorName === 'System' || bp.creatorName === 'Unknown' || !bp.creatorName) ? 0 : bp.price
        }));
      }
      return [];
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
      const res = await apiClient.get<string[]>('/api/Blueprints/suggestions');
      if (res && res.length > 0) return res;
      return _FALLBACK_PROMPTS;
    } catch (e) {
      return _FALLBACK_PROMPTS;
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

  async requestBlueprintAccess(blueprintId: string, creatorId?: string) {
    return apiClient.post('/api/AccessRequests', { blueprintId, creatorId });
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
  async getUserProgressSummary(): Promise<any[]> {
    try {
      return await apiClient.get<any[]>('/api/UserProgress/summary');
    } catch {
      return [];
    }
  },
  async toggleNodeProgress(blueprintId: string, nodeId: string, status: string): Promise<void> {
    await apiClient.post('/api/UserProgress/toggle', { blueprintId, nodeId, status });
  },
  async resetUserProgress(blueprintId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/UserProgress/${blueprintId}`);
    } catch {}
  },

  // Auth & Identity
  async firebaseLogin(payload: { idToken: string; email?: string | null; name?: string | null; photoUrl?: string | null }): Promise<any> {
    return apiClient.post('/api/Auth/firebase-login', payload);
  }
};
