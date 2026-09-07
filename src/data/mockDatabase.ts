import { Blueprint, FlowchartNode, UserProgress, User, Transaction, CreatorPayout, AIGenerationLog, FlowchartEdge } from '../types/schema';

export const users: User[] = [
  {
    id: 'u-1',
    name: 'Alice Developer',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    role: 'user',
    isCreatorSubscriptionActive: false,
    walletBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'u-2',
    name: '@arch-master',
    email: 'arch@example.com',
    avatar: 'https://i.pravatar.cc/150?u=arch-master',
    role: 'creator',
    isCreatorSubscriptionActive: true,
    creatorSubscriptionId: 'sub_123456',
    walletBalance: 120.50,
    stripeAccountId: 'acct_123456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const transactions: Transaction[] = [];
export const payouts: CreatorPayout[] = [];
export const aiGenerationLogs: AIGenerationLog[] = [];

export const blueprints: Blueprint[] = [
  {
    id: 'bp-1',
    title: 'E-Commerce Microservices Blueprint',
    slug: 'e-commerce-microservices-blueprint',
    domain: 'Web Architecture',
    price: 24.99,
    isFree: false,
    rating: 4.8,
    starsCount: 128,
    techStack: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    creatorId: 'u-2',
    source: 'creator',
    isPublished: true,
    version: '1.0.0',
    allowDataTraining: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { name: '@arch-master', avatar: 'https://i.pravatar.cc/150?u=arch-master' },
    nodesCount: 42,
    description: 'A complete end-to-end architecture for a modern e-commerce platform using microservices.'
  },
  {
    id: 'bp-2',
    title: 'Production-Ready RAG Pipeline',
    slug: 'production-ready-rag-pipeline',
    domain: 'AI/ML',
    price: 19.99,
    isFree: false,
    rating: 4.9,
    starsCount: 342,
    techStack: ['Python', 'FastAPI', 'pgvector', 'LangChain'],
    creatorId: 'u-3',
    source: 'official',
    isPublished: true,
    version: '1.0.0',
    allowDataTraining: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { name: '@ai-dev', avatar: 'https://i.pravatar.cc/150?u=ai-dev' },
    nodesCount: 45,
    description: 'Deploy retrieval-augmented generation applications with high scalability.'
  },
  {
    id: 'bp-8',
    title: 'LLM Swarm Agents',
    slug: 'llm-swarm-agents',
    domain: 'AI/ML',
    price: 0,
    isFree: true,
    rating: 4.8,
    starsCount: 890,
    techStack: ['Python', 'OpenAI', 'Redis', 'Celery'],
    creatorId: 'u-1', // A user generated it
    source: 'ai_generated',
    isPublished: true,
    version: '1.0.0',
    allowDataTraining: true, // User generated, allows training
    aiPromptUsed: 'Design a system that uses multiple LLM agents to solve math problems via Redis queues.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { name: 'Alice Developer', avatar: 'https://i.pravatar.cc/150?u=alice' },
    nodesCount: 22,
    description: 'Orchestrate multiple specialized LLM agents to solve complex problems.'
  }
];

export const nodes: FlowchartNode[] = [
  // E-Commerce Microservices Blueprint (bp-1)
  {
    id: 'n-1-1',
    blueprintId: 'bp-1',
    label: 'API Gateway',
    type: 'service',
    status: 'completed',
    position: { x: 250, y: 50 },
    codeSnippet: 'const gateway = new ApiGateway({ routes: [] });',
    docsUrl: 'https://docs.konghq.com/',
    isAiGenerated: false,
    allowDataTraining: false
  },
  {
    id: 'n-1-2',
    blueprintId: 'bp-1',
    label: 'Auth Service (JWT)',
    type: 'service',
    status: 'completed',
    position: { x: 250, y: 200 },
    codeSnippet: 'const verify = (token) => jwt.verify(token, process.env.SECRET);',
    isAiGenerated: false,
    allowDataTraining: false
  },
  {
    id: 'n-1-3',
    blueprintId: 'bp-1',
    label: 'User DB',
    type: 'db',
    status: 'pending',
    position: { x: 500, y: 200 },
    isAiGenerated: false,
    allowDataTraining: false
  },
  {
    id: 'n-8-1',
    blueprintId: 'bp-8',
    label: 'Task Queue (Redis)',
    type: 'db',
    status: 'completed',
    position: { x: 300, y: 150 },
    isAiGenerated: true,
    allowDataTraining: true
  }
];

export const userProgress: UserProgress[] = [
  {
    userId: 'u-1',
    blueprintId: 'bp-1',
    completedNodeIds: ['n-1-1', 'n-1-2'],
    percentage: 28,
    lastAccessedAt: new Date().toISOString()
  }
];
