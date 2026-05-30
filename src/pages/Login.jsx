import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { useT } from '../hooks/useT';
import api from '../lib/apiClient';
import { IS_DEMO } from '../lib/demoData';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthToken, authToken } = useWarehouse();
  const t = useT();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  // In demo mode, prefill credentials so judges can sign in with one click.
  const [username, setUsername] = useState(IS_DEMO ? 'demo' : '');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [password, setPassword] = useState(IS_DEMO ? 'demo' : '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (authToken) navigate('/');
  }, [authToken, navigate]);

  // Clean up legacy remembered identifiers from previous versions
  useEffect(() => {
    localStorage.removeItem('sw_remembered_username');
    localStorage.removeItem('sw_remembered_email');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'forgot') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recoveryEmail)) {
          setError(t.login.invalidEmail);
          setIsLoading(false);
          return;
        }
        const data = await api.postJson('/forgot-password', { email: recoveryEmail });
        setOtpCode(data.otp_code || '');
        setSuccessMsg(t.login.resetCodeGenerated);
        setMode('reset');
        setIsLoading(false);
        return;
      }

      if (mode === 'reset') {
        const data = await api.postJson('/reset-password', { email: recoveryEmail, code: resetCode, new_password: newPassword });
        setSuccessMsg(data.message);
        setResetCode(''); setNewPassword(''); setOtpCode('');
        setMode('login');
        setIsLoading(false);
        return;
      }

      // Login — in demo mode any credentials work (default to a demo user)
      if (!username.trim() && !IS_DEMO) {
        setError(t.login.enterUsername);
        setIsLoading(false);
        return;
      }
      const data = await api.postJson('/login', {
        username: username.trim() || (IS_DEMO ? 'demo' : username),
        password,
      });
      setAuthToken(data.token, data.user);
      if (data.user?.must_change_password) {
        navigate('/change-password');
      } else {
        navigate('/');
      }
    } catch (e) { setError(e.message || t.login.serverError); }
    setIsLoading(false);
  };

  return (
    <div className="login-page center-layout">
      {/* ─── Form Panel ─── */}
      <div className="login-form-panel">
        <div className="login-form-container">

          {/* Brand: logo + name + tagline + co-brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem', marginBottom: '2.25rem' }}>
            <div className="login-logo-badge">
              <img src="/Paw.svg" alt="PestGuard AI" className="login-logo-img" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{t.login.brand}</span>
            </div>
            <div className="login-tagline">
              <span className="login-tagline-dot" /> Detect <span className="login-tagline-dot" /> Alert <span className="login-tagline-dot" /> Protect
            </div>

            {/* Co-brand: built for the case provider (not an ownership claim) */}
            <div className="login-cobrand">
              <span className="login-cobrand-label">Built for</span>
              <img src="/kawanlama.svg" alt="PT. Kawan Lama Group" className="login-cobrand-img" />
            </div>
          </div>

          {/* Demo-mode banner — only on the public deployment (no backend) */}
          {IS_DEMO && mode === 'login' && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.75rem 0.875rem', marginBottom: '1.25rem',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Live Preview</strong> — explore the dashboard with sample data.
                Click <strong style={{ color: 'var(--text-primary)' }}>Sign in</strong> to enter (any credentials work).
              </div>
            </div>
          )}

          <div className="login-form-header">
            {mode !== 'login' && (
              <h2>
                {mode === 'forgot' ? t.login.resetTitle : t.login.verifyTitle}
              </h2>
            )}
            <p>
              {mode === 'login'
                ? t.login.signInDesc
                : mode === 'forgot'
                ? t.login.resetDesc
                : t.login.verifyDesc}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="login-alert login-alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="login-alert login-alert-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {successMsg}
            </div>
          )}

          {/* OTP Code Display */}
          {mode === 'reset' && otpCode && (
            <div className="login-alert login-alert-demo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', opacity: 0.7 }}>{t.login.verificationCode}</div>
                <span style={{ fontFamily: '"Fira Code", monospace', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '0.2em' }}>{otpCode}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'login' && (
              <div className="login-field">
                <label htmlFor="login-username">{t.login.usernameLabel}</label>
                <div className="login-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    id="login-username"
                    type="text"
                    placeholder={t.login.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="login-field">
                <label htmlFor="login-recovery-email">{t.login.recoveryEmailLabel}</label>
                <div className="login-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="login-recovery-email"
                    type="email"
                    placeholder={t.login.recoveryEmailPlaceholder}
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="login-field">
                <div className="login-field-header">
                  <label htmlFor="login-password">{t.login.passwordLabel}</label>
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                  >
                    {t.login.forgotPassword}
                  </button>
                </div>
                <div className="login-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder={t.login.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="login-pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="login-field">
                  <label htmlFor="reset-code">{t.login.verificationCodeLabel}</label>
                  <div className="login-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      id="reset-code"
                      type="text"
                      placeholder="000000"
                      value={resetCode}
                      maxLength={6}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ textAlign: 'center', letterSpacing: '0.3em', fontWeight: '700', fontFamily: '"Fira Code", monospace' }}
                    />
                  </div>
                </div>
                <div className="login-field">
                  <label htmlFor="reset-newpw">{t.login.newPasswordLabel}</label>
                  <div className="login-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      id="reset-newpw"
                      type="password"
                      placeholder={t.login.newPasswordPlaceholder}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? (
                <div className="login-spinner" />
              ) : (
                mode === 'login' ? t.login.signIn : mode === 'forgot' ? t.login.sendResetCode : t.login.updatePassword
              )}
            </button>

            {/* Back to login */}
            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                className="login-back"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setOtpCode(''); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                {t.login.backToSignIn}
              </button>
            )}
          </form>

          {/* Footer */}
          <p className="login-footer">
            {t.login.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
