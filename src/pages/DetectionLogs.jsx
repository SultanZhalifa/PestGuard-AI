import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';

export default function DetectionLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const { logs: allLogs } = useWarehouse();
  
  // Typing animation state
  const placeholders = ["Search 'Snake'...", "Search 'Zone A'...", "Search 'Contamination'..."];
  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentPhrase = placeholders[phraseIndex];

    if (isDeleting) {
      if (placeholderText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % placeholders.length);
        timer = setTimeout(() => {}, 400); // Wait before typing next
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1));
        }, 40); // Deletion speed
      }
    } else {
      if (placeholderText === currentPhrase) {
        timer = setTimeout(() => setIsDeleting(true), 2000); // Wait before deleting
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        }, 80); // Typing speed
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, phraseIndex]);

  // We no longer need to fetch manually, WarehouseContext provides live data!
  const loading = allLogs.length === 0 && !searchTerm; // simple loading check

  const handleExportCSV = () => {
    if (allLogs.length === 0) return;
    
    const headers = ['ID', 'Animal Type', 'Risk Level', 'Location', 'Date', 'Time', 'AI Confidence'];
    const csvContent = [
      headers.join(','),
      ...allLogs.map(log => [
        log.id, log.type, log.risk, `"${log.location}"`, log.date, log.time, log.confidence
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `warehouse-logs-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = allLogs.filter(log => 
    log.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '600px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Detection History</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Comprehensive log of all AI-detected entities.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '300px', flex: '1 1 auto' }}>
            <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder={placeholderText || "Search..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '12px', border: '1px solid var(--border-color)',
                outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)', transition: 'all 0.2s ease',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.boxShadow = '0 0 0 3px var(--bg-tertiary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'; }}
            />
          </div>
          <button onClick={handleExportCSV} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div style={{ 
        border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              Loading detection logs...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Animal Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Level</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{log.type}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`alert-badge alert-${log.risk}`}>
                        <span className="status-dot"></span>
                        {log.risk === 'danger' ? 'HAZARD' : log.risk === 'info' ? 'AUTHORIZED' : 'CONTAMINATION'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{log.location}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{log.date}</span>
                        <span style={{ fontSize: '0.75rem' }}>{log.time}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: log.confidence, backgroundColor: 'var(--accent-primary)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{log.confidence}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <span>No detections found matching "{searchTerm}"</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
