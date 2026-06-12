import { Component } from 'react';

/**
 * ErrorBoundary — catches render/runtime errors so the app never white-screens.
 * Shows a branded recovery card with reload action.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem', background: 'var(--bg-primary, #faf9f7)' }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '2.5rem 2rem', borderRadius: 20, border: '1px solid var(--border-color, #e7e5e4)', background: 'var(--bg-secondary, #fff)', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <img src="/Paw.svg" alt="PestGuard AI" style={{ width: 48, height: 48, marginBottom: '1rem', opacity: 0.85 }} />
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #1c1917)' }}>Terjadi kesalahan tak terduga</h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary, #78716c)', lineHeight: 1.6 }}>
            Aplikasi mengalami error. Muat ulang halaman untuk melanjutkan — data deteksi Anda tetap aman.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.625rem 1.5rem', borderRadius: 10, border: 'none', background: 'var(--accent-primary, #1c1917)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }
}
