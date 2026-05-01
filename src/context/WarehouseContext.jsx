import React, { createContext, useState, useEffect, useContext } from 'react';

const WarehouseContext = createContext();

export function useWarehouse() {
  return useContext(WarehouseContext);
}

export function WarehouseProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('token'));

  // Sync token to sessionStorage and state
  const login = (token) => {
    sessionStorage.setItem('token', token);
    setAuthToken(token);
  };
  const logout = () => {
    sessionStorage.removeItem('token');
    setAuthToken(null);
  };

  // Setup WebSocket when authenticated
  useEffect(() => {
    if (!authToken) return;
    
    const ws = new WebSocket('ws://localhost:8000/api/ws/alerts');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const alertId = data.id || Date.now() + Math.random();
      
      const newAlert = { ...data, id: alertId };
      setAlerts(prev => [...prev, newAlert]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }, 5000);

      // Automatically unshift to logs table
      setLogs(prev => [newAlert, ...prev]);
    };
    
    return () => ws.close();
  }, [authToken]);

  // Initial Data Fetch
  useEffect(() => {
    if (!authToken) return;

    // Fetch initial logs
    fetch('/api/logs', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.detail) setLogs(data); // prevent setting unauthorized errors as data
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
      alerts, logs, setLogs, darkMode, toggleDarkMode, authToken, login, logout 
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}
