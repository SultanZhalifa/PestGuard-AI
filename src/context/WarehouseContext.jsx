import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const WarehouseContext = createContext();

export function useWarehouse() {
  return useContext(WarehouseContext);
}

export function WarehouseProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('sw_token'));

  // Sync token to localStorage with 24h TTL
  const login = useCallback((token) => {
    const tokenData = { token, expires: Date.now() + 86400000 }; // 24 hours
    localStorage.setItem('sw_token', token);
    localStorage.setItem('sw_token_meta', JSON.stringify(tokenData));
    setAuthToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_token_meta');
    setAuthToken(null);
    setLogs([]);
    setLogsLoaded(false);
  }, []);

  // On mount: check if token is expired locally, then verify with server
  useEffect(() => {
    const token = localStorage.getItem('sw_token');
    const meta = localStorage.getItem('sw_token_meta');

    if (!token) return;

    // Check local expiry first
    if (meta) {
      try {
        const parsed = JSON.parse(meta);
        if (Date.now() > parsed.expires) {
          logout();
          return;
        }
      } catch { /* ignore parse errors */ }
    }

    // Verify token with server
    fetch('/api/verify-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          logout();
        }
      })
      .catch(() => {
        // Server unreachable — keep token but don't force logout
        console.warn('Could not verify token — server may be offline.');
      });
  }, [logout]);

  // Setup WebSocket when authenticated (dynamic URL)
  useEffect(() => {
    if (!authToken) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port === '5173' ? '8000' : window.location.port;
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/api/ws/alerts`;

    let ws;
    let reconnectTimer;
    let reconnectAttempts = 0;
    const maxReconnectDelay = 30000;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const alertId = data.id || Date.now() + Math.random();
          const newAlert = { ...data, id: alertId };

          setAlerts(prev => [...prev, newAlert]);
          setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== alertId));
          }, 5000);

          // Automatically add to logs
          setLogs(prev => [newAlert, ...prev]);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
        reconnectAttempts++;
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [authToken]);

  // Initial Data Fetch
  useEffect(() => {
    if (!authToken) return;

    // Fetch initial logs
    fetch('/api/logs', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLogsLoaded(true);
      })
      .catch(() => {
        setLogsLoaded(true); // Mark as loaded even on error to prevent infinite loading
      });

    // Fetch settings for dark mode
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.darkMode !== undefined) {
          setDarkMode(data.darkMode);
          document.body.classList.toggle('dark-mode', data.darkMode);
        }
      });
  }, [authToken]);

  // Global Dark Mode Toggle
  const toggleDarkMode = (isDark) => {
    setDarkMode(isDark);
    document.body.classList.toggle('dark-mode', isDark);
  };

  return (
    <WarehouseContext.Provider value={{
      alerts, logs, setLogs, logsLoaded, darkMode, toggleDarkMode, authToken, login, logout
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}
