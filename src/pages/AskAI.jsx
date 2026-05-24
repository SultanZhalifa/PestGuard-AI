import React, { useState, useRef, useEffect } from 'react';
import api from '../lib/apiClient';

/* ─── SVG Icon Library (inline, no deps) ─── */
const Icon = {
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  FileText: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  User: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

/* ─── Markdown-lite renderer (bold, bullet) ─── */
function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : p
    );
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    return (
      <React.Fragment key={i}>
        {isBullet
          ? <div style={{ paddingLeft: '0.75rem', marginTop: '0.2rem' }}>{rendered}</div>
          : <div style={{ marginTop: i > 0 && line === '' ? '0.5rem' : 0 }}>{rendered}</div>}
      </React.Fragment>
    );
  });
}

/* ─── Suggestion chips ─── */
const SUGGESTIONS = [
  { Icon: Icon.MapPin,       text: 'Zona mana yang paling berbahaya?' },
  { Icon: Icon.BarChart,     text: 'Berapa total deteksi ular bulan ini?' },
  { Icon: Icon.Clock,        text: 'Jam berapa paling sering ada deteksi?' },
  { Icon: Icon.FileText,     text: 'Buatkan ringkasan laporan keamanan hari ini' },
  { Icon: Icon.Search,       text: 'Apa rekomendasi untuk meningkatkan keamanan gudang?' },
];

const WELCOME = {
  role: 'ai',
  text: 'Halo! Saya **SmartWarehouse AI** — powered by **Google Gemini 2.0 Flash**.\n\nSaya memiliki akses ke data real-time gudang PT. Kawan Lama: statistik deteksi, analisis zona, pola waktu risiko, dan riwayat insiden.\n\nSilakan ajukan pertanyaan dalam Bahasa Indonesia atau English, atau pilih dari pertanyaan di bawah.',
  timestamp: new Date(),
  powered_by: 'gemini-2.0-flash',
};

/* ─── Bot avatar using icon ask ai.png ─── */
const BotAvatar = ({ size = 34 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: size > 40 ? '16px' : '10px',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: size > 40 ? '0 4px 16px rgba(59,130,246,0.25)' : 'none',
  }}>
    <img
      src="/ask ai.svg"
      alt="AI Assistant"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  </div>
);

export default function AskAI() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [poweredBy, setPoweredBy] = useState('gemini-2.0-flash');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: q, timestamp: new Date() }]);
    setLoading(true);

    try {
      const data = await api.postJson('/chat', { message: q });
      if (data.powered_by) setPoweredBy(data.powered_by);
      setMessages(prev => [...prev, {
        role: 'ai', text: data.answer, powered_by: data.powered_by, timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Terjadi kesalahan saat menghubungi server. Pastikan backend berjalan dan coba lagi.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0, flex: 1 }}>

      {/* ── Header ── */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <BotAvatar size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            AI Warehouse Assistant
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Tanya tentang deteksi, zona, statistik, atau laporan keamanan
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {poweredBy && poweredBy.includes('gemini') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', fontWeight: '700',
              color: '#6366f1', background: 'rgba(99,102,241,0.08)', padding: '0.25rem 0.6rem',
              borderRadius: '99px', border: '1px solid rgba(99,102,241,0.25)', whiteSpace: 'nowrap' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Gemini 2.0
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.08)', padding: '0.25rem 0.6rem', borderRadius: '99px', border: '1px solid rgba(34,197,94,0.2)', whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
            ONLINE
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="card custom-scrollbar ask-ai-chat-container" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'pageEnter 0.3s ease-out' }}>
            {msg.role === 'ai' && <BotAvatar size={34} />}
            {msg.role === 'ai' && <div style={{ width: '0.625rem' }} />}

            <div style={{
              maxWidth: msg.role === 'user' ? 'min(72%, 420px)' : 'min(85%, 520px)',
              padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              backgroundColor: msg.role === 'user' ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
              fontSize: '0.9rem', lineHeight: '1.6',
              boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              {msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}
              <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.timestamp?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.role === 'user' && (
              <>
                <div style={{ width: '0.625rem' }} />
                <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  <Icon.User />
                </div>
              </>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', animation: 'pageEnter 0.3s ease-out' }}>
            <BotAvatar size={34} />
            <div style={{ padding: '0.875rem 1.125rem', borderRadius: '4px 18px 18px 18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion Chips ── */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flexShrink: 0, paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s.text)}
            disabled={loading}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '99px', fontSize: '0.76rem', fontWeight: '600',
              backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              transition: 'border-color 0.15s ease, color 0.15s ease, transform 0.15s ease', opacity: loading ? 0.5 : 1,
              fontFamily: 'var(--font-family)', whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseOver={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <s.Icon />{s.text}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tanya tentang keamanan gudang... (Enter untuk kirim)"
          disabled={loading}
          style={{
            flex: 1, padding: '0.75rem 1rem', borderRadius: '12px',
            border: '1px solid var(--border-color)', outline: 'none',
            fontSize: '0.9rem', color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-primary)', fontFamily: 'var(--font-family)',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--text-secondary)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 46, height: 46, borderRadius: '12px',
            backgroundColor: input.trim() && !loading ? 'var(--text-primary)' : 'var(--bg-tertiary)',
            color: input.trim() && !loading ? 'var(--bg-primary)' : 'var(--text-secondary)',
            border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.2s ease, color 0.2s ease', flexShrink: 0,
          }}
        >
          {loading
            ? <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <Icon.Send />
          }
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
