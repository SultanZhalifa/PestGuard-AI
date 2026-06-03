import { useState, useEffect, useRef, memo } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import CommandPalette from '../components/common/CommandPalette';
import { useT } from '../hooks/useT';

const ROLE_BADGE_COLORS = {
  admin:    { bg: 'rgba(185, 28, 28, 0.12)', fg: '#b91c1c', label: 'Admin' },
  manager:  { bg: 'rgba(109, 40, 217, 0.12)', fg: '#6d28d9', label: 'Manager' },
  operator: { bg: 'rgba(4, 120, 87, 0.12)',   fg: '#047857', label: 'Operator' },
};

const PAGE_META = {
  '/':               { title: 'Live Monitor',       subtitle: 'Real-time warehouse surveillance' },
  '/logs':           { title: 'Detection Logs',      subtitle: 'Comprehensive history of AI-detected events' },
  '/ask-ai':         { title: 'Ask AI',              subtitle: 'Warehouse assistant powered by Gemini 2.0 Flash' },
  '/sop-mitigasi':   { title: 'SOP & ROI',           subtitle: 'Standard operating procedures and ROI calculator' },
  '/analysis':       { title: 'Risk Analysis',       subtitle: 'Executive risk report and detection analytics' },
  '/ai-performance': { title: 'AI Model Performance', subtitle: 'Custom-trained YOLO11 model metrics' },
  '/users':          { title: 'User Management',     subtitle: 'Manage warehouse staff accounts, roles, and access' },
  '/settings':       { title: 'Settings',            subtitle: 'System preferences and global configurations' },
};

const NavClock = memo(function NavClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="top-nav-clock" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{time}</span>
    </div>
  );
});

const SearchHint = memo(function SearchHint({ hints }) {
  const [text, setText] = useState(hints[0]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const phrase = hints[phraseIdx];
    let timer;
    if (deleting) {
      if (text === '') { setDeleting(false); setPhraseIdx(i => (i + 1) % hints.length); return; } // eslint-disable-line react-hooks/set-state-in-effect
      timer = setTimeout(() => setText(phrase.substring(0, text.length - 1)), 28);
    } else {
      if (text === phrase) { timer = setTimeout(() => setDeleting(true), 2200); return; }
      const next = phrase[text.length];
      const speed = next === ' ' ? 90 : 55 + Math.random() * 35;
      timer = setTimeout(() => setText(phrase.substring(0, text.length + 1)), speed);
    }
    return () => clearTimeout(timer);
  }, [text, deleting, phraseIdx, hints]);

  return (
    <span style={{ minWidth: '120px', display: 'inline-block', textAlign: 'left' }}>
      {text}
      <span style={{ display: 'inline-block', width: '1px', opacity: cursorVisible ? 1 : 0, marginLeft: '1px', color: 'var(--accent-primary)', transition: 'opacity 0.05s' }}>|</span>
    </span>
  );
});

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('pestguard_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const { alerts, logout, authToken, user, hasRole } = useWarehouse();
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const prevAlertsLen = useRef(0);

  // Close mobile sidebar + reset scroll on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('pestguard_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  // ── Browser Audio Alarm for DANGER alerts ──────────────────────────────
  useEffect(() => {
    const newAlerts = alerts.slice(prevAlertsLen.current);
    prevAlertsLen.current = alerts.length;
    const dangerAlert = newAlerts.find(a => a.risk === 'danger');
    if (dangerAlert) {
      try {
        // Use Web Audio API to generate alarm beeps (no external file needed)
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const playBeep = (startTime, freq = 880) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
            osc.start(startTime);
            osc.stop(startTime + 0.4);
          };
          // 3 alarm beeps
          playBeep(ctx.currentTime, 880);
          playBeep(ctx.currentTime + 0.5, 1100);
          playBeep(ctx.currentTime + 1.0, 880);
        }
      } catch (e) {
        console.warn('[ALARM] Web Audio API not available:', e);
      }
    }
  }, [alerts]);
  // ── End Alarm ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
      return;
    }
    if (user?.must_change_password) {
      navigate('/change-password');
    }
  }, [authToken, user, navigate]);

  const handleSignOut = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const badge = ROLE_BADGE_COLORS[user?.role] || { bg: 'var(--bg-tertiary)', fg: 'var(--text-secondary)', label: user?.role || '—' };
  const pageMeta = PAGE_META[location.pathname] || { title: 'Bio-Hazard Detection', subtitle: 'PT. Kawan Lama Surveillance' };

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  const searchHints = t.search.hints;

  return (
    <div className="app-container">
      <CommandPalette />

      {/* Mobile sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Real-Time Toast Notifications */}
      <div className="realtime-toast-container" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none', maxWidth: '420px', width: 'calc(100vw - 3rem)' }}>
        {alerts.map((alert) => (
          <div key={alert.id} style={{
            backgroundColor: alert.risk === 'danger' ? 'var(--alert-danger-bg)' : 'var(--alert-warning-bg)',
            border: `1px solid ${alert.risk === 'danger' ? 'var(--alert-danger)' : 'var(--alert-warning)'}`,
            padding: '1rem 1.25rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            animation: 'toastSlideIn 0.4s cubic-bezier(0.21, 1.02, 0.73, 1)',
            display: 'flex', alignItems: 'center', gap: '1rem', pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: alert.risk === 'danger' ? 'var(--alert-danger)' : 'var(--alert-warning)' }}>
              {alert.risk === 'danger' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              )}
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700' }}>{alert.type} Detected!</h4>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar${isSidebarOpen ? ' sidebar--open' : ''}${isSidebarCollapsed ? ' sidebar--collapsed' : ''}`}>
        {/* Collapse toggle (desktop only) */}
        <button className="sidebar-collapse-btn" onClick={toggleSidebarCollapse} aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isSidebarCollapsed ? 'Expand' : 'Collapse'}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        {/* Logo */}
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem', flexShrink: 0 }}>
          <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/Paw.svg" alt="Paw Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="sidebar-logo-text" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em' }}>PestGuard AI</span>
        </div>

        {/* Nav — scrollable middle section */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Main */}
          <p className="nav-section-label">{t.nav.main}</p>
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 3-9h6"/></svg>
            <span className="nav-label">{t.nav.liveMonitor}</span>
          </NavLink>
          <NavLink to="/logs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span className="nav-label">{t.nav.detectionLogs}</span>
          </NavLink>
          <NavLink to="/ask-ai" style={{ position: 'relative' }} className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
            {({ isActive }) => (
              <>
                <img src="/ask ai.svg" alt="Ask AI" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 4, flexShrink: 0, filter: isActive ? 'brightness(0) invert(1)' : 'none' }} />
                <span className="nav-label">Ask AI</span>
              </>
            )}
          </NavLink>
          <NavLink to="/sop-mitigasi" className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="nav-label">SOP & ROI</span>
          </NavLink>

          {/* Analytics — only admin/manager */}
          {hasRole && hasRole('admin', 'manager') && (<>
            <p className="nav-section-label">{t.nav.analytics}</p>
            <NavLink to="/analysis" className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span className="nav-label">{t.nav.riskAnalysis}</span>
            </NavLink>
            <NavLink to="/ai-performance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span className="nav-label">{t.nav.aiPerformance}</span>
            </NavLink>
          </>)}

          {/* Admin */}
          {hasRole && hasRole('admin') && (<>
            <p className="nav-section-label">{t.nav.admin}</p>
            <NavLink to="/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="nav-label">{t.nav.userManagement}</span>
            </NavLink>
          </>)}

          {hasRole && hasRole('admin', 'manager') && (
            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link inactive"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span className="nav-label">{t.nav.settings}</span>
            </NavLink>
          )}
        </nav>

        {/* Bottom: user info + sign out */}
        {user && (
          <div style={{ flexShrink: 0, paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div className="sidebar-user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: badge.bg, color: badge.fg, fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>
                {(user.name || user.username || '?').charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                <p className="sidebar-user-name" style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.username}</p>
                <p className="sidebar-user-role" style={{ margin: 0, fontSize: '0.65rem', fontWeight: '700', color: badge.fg, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{badge.label}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="sidebar-signout-btn"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: '8px',
                backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: '600', transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--fn-danger-bg)'; e.currentTarget.style.color = 'var(--fn-danger)'; e.currentTarget.style.borderColor = 'var(--fn-danger-border)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="sidebar-signout-text">{t.nav.signOut}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-nav">
          <div className="top-nav-left">
            {/* Hamburger — visible only on mobile */}
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
            <div className="top-nav-title">
              <h2>{pageMeta.title}</h2>
              <p className="top-nav-subtitle">{pageMeta.subtitle}</p>
            </div>
          </div>

          <div className="top-nav-right">
            {/* Command palette trigger — hidden on mobile */}
            <button
              className="top-nav-search-btn"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
              title={`Quick search (${isMac ? '⌘' : 'Ctrl'}+K)`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)', borderRadius: '8px',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '0.8125rem', fontWeight: '500',
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <SearchHint hints={searchHints} />
              <span style={{
                fontSize: '0.7rem', padding: '0.1rem 0.35rem',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: '4px', fontFamily: 'SFMono-Regular, Consolas, monospace',
                color: 'var(--text-secondary)',
              }}>{isMac ? '⌘K' : 'Ctrl+K'}</span>
            </button>

            {/* User info + role badge — hidden on mobile (shown in sidebar) */}
            {user && (
              <div className="top-nav-user-badge">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: badge.bg, color: badge.fg, fontWeight: '700', fontSize: '0.75rem' }}>
                  {(user.name || user.username || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)' }}>{user.name || user.username}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: '600', color: badge.fg, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{badge.label}</span>
                </div>
              </div>
            )}

            <NavClock />

          </div>
        </header>

        {/* Dynamic Page Content Rendered Here */}
        <div className="dashboard-content">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
