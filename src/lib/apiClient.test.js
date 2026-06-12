import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import api from './apiClient';

// VITE_API_BASE_URL is unset under Vitest, so the client uses the same-origin
// '/api' base (the Vite dev-proxy path) — these tests pin that behaviour.

describe('apiClient — URL builders', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('streamUrl appends the auth token as a query param', () => {
    localStorage.setItem('sw_token', 'abc123');
    expect(api.streamUrl('/video_feed/zone-a')).toBe('/api/video_feed/zone-a?token=abc123');
  });

  it('streamUrl omits the token param when not logged in', () => {
    expect(api.streamUrl('/video_feed/zone-a')).toBe('/api/video_feed/zone-a');
  });

  it('wsUrl uses the ws: protocol and carries the auth token', () => {
    localStorage.setItem('sw_token', 'abc123');
    const url = api.wsUrl('/ws/alerts');
    expect(url.startsWith('ws://')).toBe(true);
    expect(url).toContain('/api/ws/alerts');
    expect(url).toContain('token=abc123');
  });
});
