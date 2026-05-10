import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { useT } from '../hooks/useT';

/* All commands; some are role-gated and filtered before render. */
function buildCommands({ navigate, logout, hasRole, t }) {
  const cp = t.commandPalette;
  const cmds = [
    {
      id: 'nav-live',
      label: cp.goToLiveMonitor,
      sub: cp.goToLiveMonitorSub,
      keywords: 'live monitor camera video feed zone',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 3-9h6"/></svg>
      ),
      run: () => navigate('/'),
    },
    {
      id: 'nav-logs',
      label: cp.goToDetectionLogs,
      sub: cp.goToDetectionLogsSub,
      keywords: 'logs detection history records csv export',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
      ),
      run: () => navigate('/logs'),
    },
    {
      id: 'nav-analysis',
      label: cp.goToRiskAnalysis,
      sub: cp.goToRiskAnalysisSub,
      keywords: 'risk analysis charts heatmap report pdf',
      requireRoles: ['admin', 'manager'],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      ),
      run: () => navigate('/analysis'),
    },
    {
      id: 'nav-ai-perf',
      label: cp.goToAiPerformance,
      sub: cp.goToAiPerformanceSub,
      keywords: 'ai performance model yolo accuracy map metrics',
      requireRoles: ['admin', 'manager'],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      ),
      run: () => navigate('/ai-performance'),
    },
    {
      id: 'nav-users',
      label: cp.goToUserManagement,
      sub: cp.goToUserManagementSub,
      keywords: 'users management admin role rbac people team',
      requireRoles: ['admin'],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      ),
      run: () => navigate('/users'),
    },
    {
      id: 'nav-settings',
      label: cp.goToSettings,
      sub: cp.goToSettingsSub,
      keywords: 'settings preferences config threshold theme dark',
      requireRoles: ['admin', 'manager'],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      ),
      run: () => navigate('/settings'),
    },
    {
      id: 'action-toggle-theme',
      label: cp.toggleDarkMode,
      sub: cp.toggleDarkModeSub,
      keywords: 'theme dark light mode appearance display',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      ),
      run: () => document.body.classList.toggle('dark-mode'),
    },
    {
      id: 'action-signout',
      label: cp.signOut,
      sub: cp.signOutSub,
      keywords: 'logout signout exit quit leave',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      ),
      run: () => { logout(); navigate('/login'); },
    },
  ];

  return cmds.filter(c => !c.requireRoles || (hasRole && hasRole(...c.requireRoles)));
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const navigate = useNavigate();
  const { logout, hasRole, authToken } = useWarehouse();
  const t = useT();

  const commands = useMemo(
    () => buildCommands({ navigate, logout, hasRole, t }),
    [navigate, logout, hasRole, t]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      (c.sub && c.sub.toLowerCase().includes(q)) ||
      (c.keywords && c.keywords.toLowerCase().includes(q))
    );
  }, [commands, query]);

  /* Global Cmd/Ctrl+K listener */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  /* Reset on close */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  /* Clamp activeIndex when filtered shrinks */
  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered, activeIndex]);

  /* Keep selected item visible */
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('.cmdk-item.active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!authToken || !open) return null;

  const runCommand = (cmd) => {
    setOpen(false);
    /* Defer so the close animation/state settles before navigation/action */
    setTimeout(() => cmd.run(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) runCommand(cmd);
    }
  };

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-panel" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmdk-input"
          type="text"
          placeholder={t.commandPalette.placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        <div ref={listRef} className="cmdk-list custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="cmdk-empty">{t.commandPalette.noMatch.replace('{query}', query)}</div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`cmdk-item ${idx === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => runCommand(cmd)}
              >
                <span className="cmdk-item-icon">{cmd.icon}</span>
                <span className="cmdk-item-label">
                  <span>{cmd.label}</span>
                  {cmd.sub && <span className="cmdk-item-sub">{cmd.sub}</span>}
                </span>
                {idx === activeIndex && <span className="cmdk-shortcut">↵</span>}
              </div>
            ))
          )}
        </div>

        <div className="cmdk-footer">
          <span><kbd className="cmdk-shortcut">↑↓</kbd> {t.commandPalette.navigate}</span>
          <span><kbd className="cmdk-shortcut">↵</kbd> {t.commandPalette.select}</span>
          <span><kbd className="cmdk-shortcut">Esc</kbd> {t.commandPalette.close}</span>
          <span style={{ marginLeft: 'auto' }}>{filtered.length} {filtered.length === 1 ? t.commandPalette.command : t.commandPalette.commands}</span>
        </div>
      </div>
    </div>
  );
}
