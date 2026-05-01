import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type, exiting: false }]);
    
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
            onClick={() => dismissToast(toast.id)}
          >
            <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>
              {toast.type === 'danger' ? '🚨' : toast.type === 'warning' ? '⚠️' : toast.type === 'success' ? '✅' : '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                {toast.type === 'danger' ? 'HAZARD ALERT' : toast.type === 'warning' ? 'WARNING' : toast.type === 'success' ? 'CLEARED' : 'DETECTION'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <div style={{ 
              fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', 
              fontWeight: '600', opacity: 0.6 
            }}>
              Just now
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
