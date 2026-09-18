/**
 * Centralized API Client for STEEPCOREAPI (https://steepcoreapi.onrender.com)
 */

let envBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL;
if (envBaseUrl && (envBaseUrl === '/' || envBaseUrl.includes('run.app') || envBaseUrl.includes('localhost'))) {
  envBaseUrl = null; // Ignore self-referential or local URLs for the backend API
}
const BASE_URL = envBaseUrl || 'https://steepcoreapi.onrender.com';

export interface ApiError {
  message: string;
  status?: number;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('steepcore_token');
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('steepcore_token', token);
  } else {
    localStorage.removeItem('steepcore_token');
  }
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('steepcore_refresh_token');
};

export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('steepcore_refresh_token', token);
  } else {
    localStorage.removeItem('steepcore_refresh_token');
  }
};


// High-performance tiered cache (Memory + LocalStorage SWR)
const requestCache = new Map<string, { timestamp: number, data: any }>();
const inFlightRequests = new Map<string, Promise<any>>();

const CACHE_FRESH_MS = 1000 * 60 * 5; // 5 minutes completely fresh
const CACHE_STORAGE_PREFIX = 'steepcore_cache_';

function getStoredCache(key: string): { timestamp: number, data: any } | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredCache(key: string, data: any) {
  try {
    localStorage.setItem(CACHE_STORAGE_PREFIX + key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch {
    // If quota exceeded, prune oldest steepcore caches
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_STORAGE_PREFIX));
      for (const k of keys) {
        localStorage.removeItem(k);
      }
    } catch {}
  }
}

export function clearApiCache(prefix?: string) {
  if (prefix) {
    for (const key of requestCache.keys()) {
      if (key.includes(prefix)) requestCache.delete(key);
    }
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(CACHE_STORAGE_PREFIX) && key.includes(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  } else {
    requestCache.clear();
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(CACHE_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method === 'GET';
  
  if (isGet) {
    // 1. Check in-memory cache
    const memCached = requestCache.get(endpoint);
    if (memCached) {
      const age = Date.now() - memCached.timestamp;
      if (age < CACHE_FRESH_MS) {
        return memCached.data;
      }
      // If stale, trigger background revalidation and return immediately
      backgroundRevalidate(endpoint, options);
      return memCached.data;
    }

    // 2. Check localStorage cache
    const storageCached = getStoredCache(endpoint);
    if (storageCached) {
      requestCache.set(endpoint, storageCached);
      const age = Date.now() - storageCached.timestamp;
      if (age < CACHE_FRESH_MS) {
        return storageCached.data;
      }
      // If stale, trigger background revalidation and return immediately
      backgroundRevalidate(endpoint, options);
      return storageCached.data;
    }

    // 3. Deduplicate in-flight requests
    if (inFlightRequests.has(endpoint)) {
      return inFlightRequests.get(endpoint) as Promise<T>;
    }
  } else {
    // Mutation: clear related caches
    if (endpoint.includes('/api/Blueprints')) {
      clearApiCache('/api/Blueprints');
    }
  }

  const execute = async (): Promise<T> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const baseUrlSanitized = BASE_URL.replace(/\/$/, '');
    const endpointSanitized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    let url = endpoint.startsWith('http') ? endpoint : `${baseUrlSanitized}${endpointSanitized}`;
    // Route AI requests to local Express server instead of remote backend
    if (endpoint.toLowerCase().includes('/api/ai/')) {
      url = endpointSanitized;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      // Handle token refresh on 401
      if (response.status === 401 && getRefreshToken()) {
        const refreshed = await refreshTokenApi();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${getAuthToken()}`;
          const retryRes = await fetch(url, { ...options, headers });
          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => ({}));
            throw new Error(errData.message || `API Error (${retryRes.status})`);
          }
          try {
            const text = await retryRes.text();
            return JSON.parse(text);
          } catch {
            throw new Error("Failed to parse JSON from " + url + " after retry - Server returned HTML.");
          }
        }
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        
        let msg = '';
        if (errData.errors && typeof errData.errors === 'object') {
          if (Array.isArray(errData.errors) && errData.errors.length > 0 && typeof errData.errors[0] === 'object') {
              msg = errData.errors.map((e: any) => e.description || JSON.stringify(e)).join(', ');
          } else {
              msg = Object.values(errData.errors).flat().join(', ');
          }
        } else {
          msg =
            (errData.error && typeof errData.error.message === 'string' && errData.error.message) ||
            (typeof errData.message === 'string' && errData.message) ||
            (typeof errData.error === 'string' && errData.error) ||
            (typeof errData.title === 'string' && errData.title) ||
            `Request failed with status ${response.status}`;
        }
        
        if (response.status === 503 || response.status === 429) {
          if (msg) throw new Error(msg);
          throw new Error('The AI service is currently busy or warming up (503). Please try again in a few seconds.');
        }
        throw new Error(msg);
      }

      let data;
      const text = await response.text();
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
          throw new Error("Server returned an HTML page instead of JSON. The service might be restarting or unavailable.");
      }
      
      try {
        data = JSON.parse(text);
      } catch {
        console.error("HTML/Invalid data received:", text.substring(0, 500));
        throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");
      }
      if (data && data.error) {
        const msg = typeof data.error === 'string' 
          ? data.error 
          : (data.error.message || JSON.stringify(data.error));
        throw new Error(msg);
      }
      
      if (isGet) {
        requestCache.set(endpoint, { timestamp: Date.now(), data });
        setStoredCache(endpoint, data);
      }

      return data;
    } catch (err: any) {
      console.warn(`[apiClient] Request to ${endpoint} failed:`, err.message || err);
      
      if (err.message === 'Failed to fetch') {
        throw new Error(
          'Failed to connect to STEEPCOREAPI. This usually happens for one of two reasons: ' +
          '1) CORS Error: Your Render API backend is blocking this app URL. Ensure your backend allows cross-origin requests (e.g., app.use(cors())). ' +
          '2) Render Sleep: Your Render free instance is asleep and needs a minute to wake up.'
        );
      }
      
      throw err;
    } finally {
      if (isGet) {
        inFlightRequests.delete(endpoint);
      }
    }
  };

  if (isGet) {
    const p = execute();
    inFlightRequests.set(endpoint, p);
    return p;
  }

  return execute();
}

function backgroundRevalidate(endpoint: string, options: RequestInit) {
  if (inFlightRequests.has(endpoint)) return;
  // Fire off non-blocking fetch in background
  setTimeout(() => {
    request(endpoint, options).catch(() => {});
  }, 100);
}

async function refreshTokenApi(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/Auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (res.ok) {
      const text = await res.text();
      const data = JSON.parse(text);
      const newToken = data.token || data.accessToken;
      if (newToken) {
        setAuthToken(newToken);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to refresh token', e);
  }
  // Clear invalid tokens
  setAuthToken(null);
  setRefreshToken(null);
  return false;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
