/**
 * Centralized API Client for STEEPCOREAPI (https://steepcoreapi.onrender.com)
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://steepcoreapi.onrender.com';

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
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrlSanitized}${endpointSanitized}`;

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
        return await retryRes.json();
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg =
        (errData.error && typeof errData.error.message === 'string' && errData.error.message) ||
        (typeof errData.message === 'string' && errData.message) ||
        (typeof errData.error === 'string' && errData.error) ||
        (typeof errData.title === 'string' && errData.title) ||
        `Request failed with status ${response.status} at ${url}`;
      
      if (response.status === 503) {
        throw new Error('STEEPCOREAPI AI service is currently busy or warming up (503 Service Unavailable). Please try again in a few seconds.');
      }
      throw new Error(msg);
    }

    const data = await response.json();
    if (data && data.error) {
      const msg = typeof data.error === 'string' 
        ? data.error 
        : (data.error.message || JSON.stringify(data.error));
      throw new Error(msg);
    }

    return data;
  } catch (err: any) {
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
      const data = await res.json();
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
