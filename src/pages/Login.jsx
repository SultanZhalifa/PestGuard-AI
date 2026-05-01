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

  const inputStyle = {
    width: '100%', padding: '0.875rem 1rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '0.875rem', 
    color: '#f8fafc', backgroundColor: 'rgba(255,255,255,0.05)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  };

  const ssoButtonStyle = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s ease'
  };

  return (
    <div className="login-bg" style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'var(--font-family)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Floating particles */}
      <div className="login-particle" style={{ width: 300, height: 300, top: '10%', left: '-5%', opacity: 0.5 }} />
      <div className="login-particle" style={{ width: 200, height: 200, bottom: '10%', right: '-3%', opacity: 0.3 }} />
      <div className="login-particle" style={{ width: 150, height: 150, top: '60%', left: '20%', opacity: 0.2 }} />

      {/* Subtle grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 80px -15px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 10,
        animation: 'pageEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards'
      }}>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75z"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em' }}>
              SmartWarehouse
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI-Powered Pest Surveillance System
          </p>
        </div>

        {/* Toggle Log In / Sign Up */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px', padding: '0.375rem', marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1, padding: '0.625rem', border: 'none', borderRadius: '8px',
                backgroundColor: mode === 'login' ? '#3b82f6' : 'transparent',
                color: mode === 'login' ? '#fff' : '#94a3b8',
                fontWeight: mode === 'login' ? '700' : '500', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1, padding: '0.625rem', border: 'none', borderRadius: '8px',
                backgroundColor: mode === 'signup' ? '#3b82f6' : 'transparent',
                color: mode === 'signup' ? '#fff' : '#94a3b8',
                fontWeight: mode === 'signup' ? '700' : '500', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset password'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {mode === 'login' ? 'Enter your credentials to access the dashboard.' : mode === 'signup' ? 'Start your automated surveillance journey.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(220,38,38,0.2)' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
              {successMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#cbd5e1' }}>Email</label>
            <input
              type="email" placeholder="name@company.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>Password</label>
                {mode === 'login' && <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }} style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>Forgot?</a>}
              </div>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          <button
            type="submit" disabled={isLoading}
            style={{
              width: '100%', padding: '0.875rem', marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              transition: 'all 0.2s ease', opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isLoading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
          </button>

          {mode === 'forgot' && (
            <button type="button" onClick={() => setMode('login')}
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
            >
              Back to Log In
            </button>
          )}
        </form>

        {mode !== 'forgot' && (
          <>
            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span style={{ padding: '0 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or continue with</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* SSO Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={ssoButtonStyle}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google
                </button>
                <button style={ssoButtonStyle}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#cbd5e1"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.05 2.95.72 3.4 1.8-3.22 1.96-2.66 6.01.66 7.33-.79 1.58-1.74 2.94-2.71 3.88M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" /></svg>
                  Apple
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={ssoButtonStyle}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#00A4EF" d="M1 1h10v10H1z" /><path fill="#7FBA00" d="M12 1h10v10H12z" /><path fill="#FFB900" d="M1 12h10v10H1z" /><path fill="#F25022" d="M12 12h10v10H12z" /></svg>
                  Microsoft
                </button>
                <button style={ssoButtonStyle}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#cbd5e1"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  GitHub
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#475569' }}>
          Powered by YOLO11 &bull; PT. Kawan Lama Surveillance
        </p>

      </div>

      {/* Inline spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
