
import { createPortal } from 'react-dom';

/** Snapshot lightbox modal */
export default function SnapshotModal({ src, onClose }) {
  if (!src) return null;
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out', animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
        <img
          src={src}
          alt="Detection snapshot"
          style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        />
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '-12px', right: '-12px',
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
