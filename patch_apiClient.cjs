const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

const cacheLogic = `
// Simple memory cache to dramatically speed up GET requests
const requestCache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method === 'GET';
  
  if (isGet) {
    const cached = requestCache.get(endpoint);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log("[Cache Hit] " + endpoint);
      return cached.data;
    }
  }
`;

code = code.replace(`async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {`, cacheLogic);

const cacheSetLogic = `
    if (data && data.error) {
      const msg = typeof data.error === 'string' 
        ? data.error 
        : (data.error.message || JSON.stringify(data.error));
      throw new Error(msg);
    }
    
    if (isGet) {
      requestCache.set(endpoint, { timestamp: Date.now(), data });
    }

    return data;
`;

code = code.replace(`
    if (data && data.error) {
      const msg = typeof data.error === 'string' 
        ? data.error 
        : (data.error.message || JSON.stringify(data.error));
      throw new Error(msg);
    }

    return data;
`, cacheSetLogic);


fs.writeFileSync('src/services/apiClient.ts', code);
