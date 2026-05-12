/**
 * Smart Warehouse — Centralized API Client
 * ==========================================
 * Single source of truth for all API calls.
 * Auto-injects auth headers, handles 401 redirects,
 * and provides typed response parsing.
 */

const API_BASE = '/api';

/**
 * Get current auth token from localStorage.
 */
function getToken() {
  return localStorage.getItem('sw_token');
}

/**
 * Core fetch wrapper with auth header injection and error handling.
 * @param {string} path - API path (e.g. '/logs')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<Response>}
 */
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Auto-logout on 401 (expired or invalid token)
  if (response.status === 401) {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_token_meta');
    localStorage.removeItem('sw_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  return response;
}

/**
 * Convenience wrappers
 */
const api = {
  get: (path, options = {}) =>
    request(path, { ...options, method: 'GET' }),

  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),

  delete: (path, options = {}) =>
    request(path, { ...options, method: 'DELETE' }),

  /**
   * GET request that automatically parses JSON response.
   */
  getJson: async (path, options = {}) => {
    const res = await request(path, { ...options, method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
  },

  /**
   * POST request that automatically parses JSON response.
   */
  postJson: async (path, body, options = {}) => {
    const res = await request(path, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    return res.json();
  },

  /**
   * Build a URL with token query param (for streaming/WS endpoints
   * that can't use Authorization headers).
   * e.g. api.streamUrl('/video_feed/zone-a') → '/api/video_feed/zone-a?token=xxx'
   */
  streamUrl: (path) => {
    const token = getToken();
    return `${API_BASE}${path}${token ? `?token=${token}` : ''}`;
  },

  /**
   * Build authenticated WebSocket URL.
   */
  wsUrl: (path) => {
    const token = getToken();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port === '5173' ? '8000' : window.location.port;
    return `${wsProtocol}//${wsHost}:${wsPort}${API_BASE}${path}${token ? `?token=${token}` : ''}`;
  },
};

export default api;
