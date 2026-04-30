import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useWarehouse();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint = mode === 'signup' ? '/api/register' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (mode === 'signup') {
          setSuccessMsg(data.message);
          setMode('login');
          setPassword('');
          setIsLoading(false);
        } else {
          // Successful login
          setAuthToken(data.token);
          navigate('/');
        }
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Authentication failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to the server. Is the Python backend running?');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'var(--font-family)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)'
      }}>

        {/* Toggle Log In / Sign Up */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '0.375rem',
            marginBottom: '2.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '0.625rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: mode === 'login' ? 'var(--text-primary)' : 'transparent',
                color: mode === 'login' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'login' ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '0.625rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: mode === 'signup' ? 'var(--text-primary)' : 'transparent',
                color: mode === 'signup' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'signup' ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            {mode === 'login' ? 'Hii' : mode === 'signup' ? 'Create an account' : 'Reset password'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {mode === 'login' ? 'Enter your details to access your dashboard.' : mode === 'signup' ? 'Start your automated surveillance journey.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--alert-danger)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--alert-success)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              {successMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.875rem 1rem', borderRadius: '10px',
                border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>Password</label>
                {mode === 'login' && <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>Forgot?</a>}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.875rem 1rem', borderRadius: '10px',
                  border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '0.875rem', marginTop: '0.75rem',
              backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? <span className="status-dot" style={{ animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-primary)' }}></span> : (mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                width: '100%', padding: '0.875rem', marginTop: '0.25rem',
                backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none',
                fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              Back to Log In
            </button>
          )}
        </form>

        {mode !== 'forgot' && (
          <>
            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or continue with</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            </div>

            {/* SSO Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'background-color 0.2s ease'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google
                </button>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.05 2.95.72 3.4 1.8-3.22 1.96-2.66 6.01.66 7.33-.79 1.58-1.74 2.94-2.71 3.88M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" /></svg>
                  Apple
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M1 1h10v10H1z" /><path fill="currentColor" d="M12 1h10v10H12z" /><path fill="currentColor" d="M1 12h10v10H1z" /><path fill="currentColor" d="M12 12h10v10H12z" /></svg>
                  Microsoft
                </button>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  GitHub
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
