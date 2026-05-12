import React, { useState, useRef, useEffect } from 'react';
import api from '../lib/apiClient';

/* ─── Markdown-lite renderer (bold, bullet, italic) ─── */
function renderMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold **text**
    let parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : p
    );
    // Bullet
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

/* ─── Suggested question chips ─── */
const SUGGESTIONS = [
  { icon: '🗺️', text: 'Zona mana yang paling berbahaya?' },
  { icon: '📊', text: 'Berapa total deteksi keseluruhan?' },
  { icon: '🐍', text: 'Berapa deteksi ular?' },
  { icon: '⏰', text: 'Jam berapa paling sering ada deteksi?' },
  { icon: '🔍', text: 'Kapan terakhir ada insiden?' },
  { icon: '📋', text: 'Buatkan ringkasan laporan keamanan' },
];

const WELCOME = {
  role: 'ai',
  text: '👋 Halo! Saya **AI Warehouse Assistant** dari SmartWarehouse.\n\nSaya siap menjawab pertanyaan Anda tentang keamanan gudang — deteksi hama, statistik zona, pola waktu, dan laporan insiden.\n\nSilakan ajukan pertanyaan di bawah, atau pilih dari pertanyaan umum! 🚀',
  timestamp: new Date(),
};

export default function AskAI() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.postJson('/chat', { message: q });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.answer,
        intent: data.intent,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '❌ Terjadi kesalahan saat menghubungi server. Pastikan backend berjalan dan coba lagi.',
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
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', gap: '1rem' }}>

      {/* Header */}
      <div className="card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
          🤖
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
            AI Warehouse Assistant
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            Tanya tentang deteksi, zona, statistik, atau laporan keamanan
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.08)', padding: '0.375rem 0.875rem', borderRadius: '99px', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
          AI ONLINE
        </div>
      </div>

      {/* Messages */}
      <div className="card custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'pageEnter 0.3s ease-out',
            }}
          >
            {msg.role === 'ai' && (
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginRight: '0.625rem', flexShrink: 0, marginTop: '0.1rem' }}>
                🤖
              </div>
            )}

            <div style={{
              maxWidth: msg.role === 'user' ? '60%' : '75%',
              padding: '0.875rem 1.125rem',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              backgroundColor: msg.role === 'user' ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              {msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}
              <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.timestamp?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.role === 'user' && (
              <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.625rem', flexShrink: 0, border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                U
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', animation: 'pageEnter 0.3s ease-out' }}>
            <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🤖</div>
            <div style={{ padding: '0.875rem 1.125rem', borderRadius: '4px 18px 18px 18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s.text)}
            disabled={loading}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '600',
              backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.15s ease', opacity: loading ? 0.5 : 1,
            }}
            onMouseOver={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span>{s.icon}</span>{s.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          onFocus={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
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
            transition: 'all 0.2s ease', flexShrink: 0,
          }}
        >
          {loading
            ? <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          }
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
