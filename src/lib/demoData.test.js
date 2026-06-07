import { describe, it, expect } from 'vitest';
import { getDemoResponse } from './demoData';

describe('demoData — auth', () => {
  it('accepts the documented demo credentials', () => {
    const res = getDemoResponse('/login', 'POST', { username: 'demo', password: 'demo123' });
    expect(res).toHaveProperty('token');
    expect(res.user.role).toBe('admin');
  });

  it('rejects wrong credentials with a 401-shaped error', () => {
    const res = getDemoResponse('/login', 'POST', { username: 'demo', password: 'nope' });
    expect(res.__demo_error).toBe(true);
    expect(res.status).toBe(401);
  });

  it('rejects an empty login body', () => {
    const res = getDemoResponse('/login', 'POST', null);
    expect(res.__demo_error).toBe(true);
  });
});

describe('demoData — core endpoints', () => {
  it('returns a non-empty detection log list', () => {
    const logs = getDemoResponse('/logs');
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toMatchObject({
      type: expect.any(String),
      risk: expect.any(String),
      location: expect.any(String),
    });
  });

  it('orders logs newest-first', () => {
    const logs = getDemoResponse('/logs');
    const first = new Date(logs[0].timestamp).getTime();
    const last = new Date(logs[logs.length - 1].timestamp).getTime();
    expect(first).toBeGreaterThanOrEqual(last);
  });

  it('reports a healthy status with the expected version', () => {
    const health = getDemoResponse('/health');
    expect(health.status).toBe('healthy');
    expect(health.version).toBe('2.0.0');
  });

  it('builds analytics with the documented sections', () => {
    const a = getDemoResponse('/analytics?time_range=weekly');
    expect(a).toHaveProperty('trend');
    expect(a).toHaveProperty('distribution');
    expect(a).toHaveProperty('zone_activity');
  });

  it('simulates writes (toggles) without a backend', () => {
    const res = getDemoResponse('/cameras/zone-a/toggle', 'POST', { state: true });
    expect(res.status).toBe('success');
  });

  it('returns undefined for unknown GET routes', () => {
    expect(getDemoResponse('/does-not-exist')).toBeUndefined();
  });
});
