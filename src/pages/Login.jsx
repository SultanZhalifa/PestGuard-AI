import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useWarehouse();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset password states
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoCode, setDemoCode] = useState('');

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem('sw_remembered_email');
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'forgot') {
        const res = await fetch('/api/forgot-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setDemoCode(data.demo_code || '');
          setSuccessMsg(data.message);
          setMode('reset');
        } else {
          setError(data.detail || 'Failed to send reset code.');
        }
        setIsLoading(false);
        return;
      }

      if (mode === 'reset') {
        const res = await fetch('/api/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: resetCode, new_password: newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessMsg(data.message);
          setResetCode(''); setNewPassword(''); setDemoCode('');
          setMode('login');
        } else {
          setError(data.detail || 'Failed to reset password.');
        }
        setIsLoading(false);
        return;
      }

      const endpoint = mode === 'signup' ? '/api/register' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
          if (rememberMe) { localStorage.setItem('sw_remembered_email', email); }
          else { localStorage.removeItem('sw_remembered_email'); }
          setAuthToken(data.token);
          navigate('/');
        }
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Authentication failed.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to the server. Is the backend running?');
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'login') return 'Welcome back';
    if (mode === 'signup') return 'Create account';
    if (mode === 'forgot') return 'Forgot password';
    return 'Reset password';
  };

  const getSubtitle = () => {
    if (mode === 'login') return 'Enter your credentials to access the dashboard.';
    if (mode === 'signup') return 'Start your automated surveillance journey.';
    if (mode === 'forgot') return "We'll send a verification code to your email.";
    return 'Enter the code and your new password.';
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-family)',
      backgroundColor: '#f0f4f8', position: 'relative', overflow: 'hidden'
    }}>

      {/* Left panel - Branding */}
      <div style={{
        flex: '0 0 45%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(59,130,246,0.05)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '3rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75z"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em' }}>SmartWarehouse</span>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#f8fafc', lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
            AI-Powered<br />Pest Surveillance
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: '380px', marginBottom: '2.5rem' }}>
            Protect your warehouse from bio-hazards with real-time YOLO11 object detection, automated alerts, and comprehensive analytics.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
            {['Real-time Detection', 'Smart Alerts', 'Risk Analytics', 'Export Reports'].map(f => (
              <span key={f} style={{
                padding: '0.4rem 0.875rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)'
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ position: 'absolute', bottom: '2rem', left: '4rem', fontSize: '0.75rem', color: '#475569' }}>
          © 2026 PT. Kawan Lama &bull; Powered by YOLO11
        </p>
      </div>

      {/* Right panel - Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Tab toggle (login/signup only) */}
          {(mode === 'login' || mode === 'signup') && (
            <div style={{
              display: 'flex', backgroundColor: '#e8edf2', borderRadius: '12px',
              padding: '4px', marginBottom: '2rem'
            }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                  style={{
                    flex: 1, padding: '0.6rem', border: 'none', borderRadius: '9px',
                    backgroundColor: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? '#0f172a' : '#64748b',
                    fontWeight: mode === m ? '700' : '500', fontSize: '0.875rem',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >{m === 'login' ? 'Log In' : 'Sign Up'}</button>
              ))}
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
              {getTitle()}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{getSubtitle()}</p>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px',
              fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{
              backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '10px',
              fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {successMsg}
            </div>
          )}

          {/* Demo code display for forgot password */}
          {mode === 'reset' && demoCode && (
            <div style={{
              backgroundColor: '#eff6ff', padding: '0.875rem 1rem', borderRadius: '10px',
              fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #bfdbfe', color: '#1d4ed8'
            }}>
              <strong>Demo Mode:</strong> Your verification code is <code style={{
                backgroundColor: '#dbeafe', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: '800', fontSize: '1rem', letterSpacing: '0.15em'
              }}>{demoCode}</code>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            
            {/* Email - always visible */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#334155' }}>Email address</label>
              <input
                type="email" placeholder="name@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                disabled={mode === 'reset'}
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                  color: '#0f172a', backgroundColor: mode === 'reset' ? '#f8fafc' : '#fff',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password - login & signup only */}
            {(mode === 'login' || mode === 'signup') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                      style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                    >Forgot password?</button>
                  )}
                </div>
                <input
                  type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  style={{
                    width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                    color: '#0f172a', backgroundColor: '#fff', transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            {/* Reset code + new password (reset mode) */}
            {mode === 'reset' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#334155' }}>Verification code</label>
                  <input
                    type="text" placeholder="Enter 6-digit code" value={resetCode} maxLength={6}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))} required
                    style={{
                      width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1.1rem',
                      color: '#0f172a', backgroundColor: '#fff', letterSpacing: '0.2em', fontWeight: '700',
                      textAlign: 'center'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#334155' }}>New password</label>
                  <input
                    type="password" placeholder="Min. 6 characters" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} required
                    style={{
                      width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                      color: '#0f172a', backgroundColor: '#fff'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </>
            )}

            {/* Remember me - login only */}
            {mode === 'login' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${rememberMe ? '#3b82f6' : '#cbd5e1'}`,
                  backgroundColor: rememberMe ? '#3b82f6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', flexShrink: 0
                }}>
                  {rememberMe && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                Remember me
              </label>
            )}

            {/* Submit button */}
            <button type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '0.875rem', marginTop: '0.25rem',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
                transition: 'all 0.2s ease', opacity: isLoading ? 0.7 : 1
              }}
              onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)'; }}}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.35)'; }}
            >
              {isLoading ? (
                <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <>
                  {mode === 'login' && 'Log In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Code'}
                  {mode === 'reset' && 'Update Password'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>

            {/* Back link for forgot/reset */}
            {(mode === 'forgot' || mode === 'reset') && (
              <button type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setDemoCode(''); }}
                style={{
                  width: '100%', padding: '0.625rem', backgroundColor: 'transparent',
                  color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Log In
              </button>
            )}
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
