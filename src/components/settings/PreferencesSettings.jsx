
/**
 * PreferencesSettings — toggles for notifications, dark mode, language
 */
export default function PreferencesSettings({ notifications, darkMode, language, onNotifToggle, onDarkToggle, onLangChange, t }) {
  const toggles = [
    { label: t.settings.pushNotifications, desc: t.settings.pushNotificationsDesc, value: notifications, toggle: onNotifToggle, color: '#047857' },
    { label: t.settings.darkModeLabel, desc: t.settings.darkModeDesc, value: darkMode, toggle: onDarkToggle, color: '#6366f1' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div className="section-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <h3 className="section-title">{t.settings.preferences}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem' }}>
        {toggles.map(({ label, desc, value, toggle, color }) => (
          <div
            key={label}
            className="pref-row"
            onClick={toggle}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{label}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>{desc}</p>
            </div>
            <div className="toggle-track" style={{ backgroundColor: value ? color : 'var(--border-color)' }}>
              <div className="toggle-thumb" style={{ left: value ? '24px' : '2px' }} />
            </div>
          </div>
        ))}

        {/* Language selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
          <div>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{t.settings.language}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>{t.settings.languageDesc}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
            {['en', 'id'].map(lang => (
              <button
                key={lang}
                onClick={() => onLangChange(lang)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem',
                  backgroundColor: language === lang ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: language === lang ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: `1px solid ${language === lang ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer', transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {lang === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
