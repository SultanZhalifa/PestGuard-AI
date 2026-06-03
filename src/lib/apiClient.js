/**
 * PestGuard AI — Centralized API Client
 * ==========================================
 * Single source of truth for all API calls.
 * - Auto-injects auth headers
 * - Handles 401 redirects (session expiry)
 * - Supports environment-based backend URL (for Vercel + ngrok/Railway deploy)
 * - Provides typed response helpers (getJson, postJson)
 * - Demo mode: when VITE_DEMO_MODE=true (public deploy w/o backend), returns
 *   realistic sample data so judges can explore the full dashboard.
 *
 * Environment:
 *   VITE_API_BASE_URL — override backend host for production deploys
 *   VITE_DEMO_MODE    — 'true' to serve built-in demo data (no backend needed)
 */

import { getDemoResponse, IS_DEMO } from './demoData';

/** Build a Response-like object so demo data flows through the same code paths. */
function demoResponse(path, method, body) {
  const data = getDemoResponse(path, method, body);
  // Handle demo-mode error responses (e.g. invalid credentials)
  if (data && data.__demo_error) {
    return {
      ok: false,
      status: data.status || 400,
      json: async () => ({ detail: data.detail || 'Request failed' }),
      blob: async () => new Blob([], { type: 'application/octet-stream' }),
      text: async () => JSON.stringify({ detail: data.detail }),
    };
  }
  const ok = data !== undefined;
  return {
    ok,
    status: ok ? 200 : 404,
    json: async () => (ok ? data : { detail: 'Not found (demo mode)' }),
    blob: async () => new Blob([], { type: 'application/octet-stream' }),
    text: async () => JSON.stringify(data ?? {}),
  };
}

/**
 * Resolve base URL from environment or fall back to same-origin /api proxy.
 * In development (Vite), VITE_API_BASE_URL is typically not set → uses Vite proxy.
 * In production (Vercel), set VITE_API_BASE_URL to the backend public URL.
 */
const _resolveBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    // Strip trailing slash, append /api
    return `${envUrl.replace(/\/$/, '')}/api`;
  }
  // Default: same-origin proxy (works for local dev with Vite proxy config)
  return '/api';
};

const API_BASE = _resolveBase();

/** Retrieve stored auth token from localStorage. */
function getToken() {
  return localStorage.getItem('sw_token');
}

/**
 * Core fetch wrapper.
 * - Injects Authorization header if token present
 * - Auto-redirects to /login on 401
 *
 * @param {string} path - API path relative to base (e.g. '/logs')
 * @param {RequestInit} options - Standard fetch options
 * @returns {Promise<Response>}
 */
async function request(path, options = {}) {
  // Demo mode: short-circuit to built-in sample data (no network).
  if (IS_DEMO) {
    let body = null;
    try { body = options.body ? JSON.parse(options.body) : null; } catch { /* non-JSON body */ }
    // Small artificial latency so loaders/skeletons still show naturally.
    await new Promise(r => setTimeout(r, 180));
    return demoResponse(path, options.method || 'GET', body);
  }

  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (e) {
    throw new Error('Cannot reach server. Check your connection or that the backend is running.', { cause: e });
  }

  // Session expired — clear storage and redirect to login
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
 * API client — convenience methods over `request`.
 */
const api = {
  /** Raw GET request. Returns Response object. */
  get: (path, options = {}) =>
    request(path, { ...options, method: 'GET' }),

  /** Raw POST request. Returns Response object. */
  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),

  /** Raw PUT request. Returns Response object. */
  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),

  /** Raw PATCH request. Returns Response object. */
  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),

  /** PATCH — auto-parses JSON. Throws with detail message on non-2xx. */
  patchJson: async (path, body, options = {}) => {
    const res = await request(path, {
      ...options,
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || `Request failed (${res.status})`);
    }
    return res.json();
  },

  /** Raw DELETE request. Returns Response object. */
  delete: (path, options = {}) =>
    request(path, { ...options, method: 'DELETE' }),

  /**
   * GET — auto-parses JSON. Throws on non-2xx responses.
   * @returns {Promise<any>}
   */
  getJson: async (path, options = {}) => {
    const res = await request(path, { ...options, method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
  },

  /**
   * POST — auto-parses JSON. Throws with detail message on non-2xx.
   * @returns {Promise<any>}
   */
  postJson: async (path, body, options = {}) => {
    const res = await request(path, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || `Request failed (${res.status})`);
    }
    return res.json();
  },

  /**
   * Build URL with token query param — for streaming/SSE endpoints
   * that cannot use Authorization headers.
   * e.g. api.streamUrl('/video_feed/zone-a')
   * @param {string} path
   * @returns {string}
   */
  streamUrl: (path) => {
    const token = getToken();
    return `${API_BASE}${path}${token ? `?token=${token}` : ''}`;
  },

  /**
   * Build authenticated WebSocket URL.
   * Automatically resolves ws:/wss: protocol from current page protocol.
   * If VITE_API_BASE_URL is set, derives WS URL from it.
   * @param {string} path
   * @returns {string}
   */
  wsUrl: (path) => {
    const token = getToken();
    const envUrl = import.meta.env.VITE_API_BASE_URL;

    if (envUrl) {
      // Convert http/https to ws/wss
      const wsBase = envUrl.replace(/^http/, 'ws').replace(/\/$/, '');
      return `${wsBase}/api${path}${token ? `?token=${token}` : ''}`;
    }

    // Default: derive from current page host (local dev)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port === '5173' ? '8000' : window.location.port;
    return `${wsProtocol}//${wsHost}:${wsPort}/api${path}${token ? `?token=${token}` : ''}`;
  },
};

export default api;
