import { useT } from '../../hooks/useT';

/**
 * PasswordStrength — lightweight strength meter (length + character variety).
 * Renders nothing for an empty password. Purely visual; does not block submit.
 */
function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4); // 0..4
}

const LEVELS = [
  { key: 'weak',   color: '#b91c1c' },
  { key: 'fair',   color: '#b45309' },
  { key: 'good',   color: '#a16207' },
  { key: 'strong', color: '#15803d' },
];

export default function PasswordStrength({ password }) {
  const t = useT();
  if (!password) return null;
  const score = scorePassword(password);
  const idx = Math.max(0, Math.min(score - 1, 3));
  const level = LEVELS[idx];

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.35rem' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i <= idx ? level.color : 'var(--border-color)',
            transition: 'background-color 0.2s ease',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: level.color }}>
        {t.passwordStrength[level.key]}
      </span>
    </div>
  );
}
