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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${getAuthToken()}`;
        const retryRes = await fetch(url, { ...options, headers });
        if (!retryRes.ok) {
          const errData = await retryRes.json().catch(() => ({}));
          throw new Error(errData.message || `API Error (${retryRes.status})`);
        }
        try {
          const text = await retryRes.text();
          return JSON.parse(text);
        } catch (parseError) {
          throw new Error("Failed to parse JSON from " + url + " after retry - Server returned HTML.");
        }
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      
      let msg = '';
      if (errData.errors && typeof errData.errors === 'object') {
        if (Array.isArray(errData.errors) && errData.errors.length > 0 && typeof errData.errors[0] === 'object') {
            // Handle ASP.NET Identity errors array [{code: "...", description: "..."}]
            msg = errData.errors.map((e: any) => e.description || JSON.stringify(e)).join(', ');
        } else {
            // Handle standard ASP.NET ModelState errors { Field: ["Error1", "Error2"] }
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
      
      if (response.status === 503) {
        if (msg) throw new Error(msg);
        throw new Error('The AI service is currently busy or warming up (503). Please try again in a few seconds.');
      }
      throw new Error(msg);
    }

    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");
    }
    if (data && data.error) {
      const msg = typeof data.error === 'string' 
        ? data.error 
        : (data.error.message || JSON.stringify(data.error));
      throw new Error(msg);
    }

    return data;
  } catch (err: any) {
    if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('rate limit'))) {
       throw new Error('The AI free generation quota has been exceeded. Please try again later.');
    }
    console.warn(`[apiClient] Request to ${endpoint} failed:`, err.message || err);
    
    // Intercept standard browser network/CORS errors
    if (err.message === 'Failed to fetch') {
      throw new Error(
        'Failed to connect to STEEPCOREAPI. This usually happens for one of two reasons: ' +
        '1) CORS Error: Your Render API backend is blocking this app URL. Ensure your backend allows cross-origin requests (e.g., app.use(cors())). ' +
        '2) Render Sleep: Your Render free instance is asleep and needs a minute to wake up.'
      );
    }
    
    throw err;
  }
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
