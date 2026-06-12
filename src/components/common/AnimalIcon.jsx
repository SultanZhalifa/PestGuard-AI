import { RISK_COLORS, DETECTION_RISK_MAP } from '../../constants/detectionConfig';

const ANIMAL_SRC = {
  snake:  '/animals/snake.svg',
  cat:    '/animals/cat.svg',
  gecko:  '/animals/gecko.svg',
  lizard: '/animals/gecko.svg',
};

/**
 * AnimalIcon — renders the detection-class silhouette (snake/cat/gecko)
 * tinted via CSS mask so any color token can be applied.
 * Props:
 *  - type:  'Snake' | 'Cat' | 'Gecko' | 'Lizard' (case-insensitive)
 *  - size:  px (default 18)
 *  - color: CSS color; defaults to the class risk color
 */
export default function AnimalIcon({ type, size = 22, color }) {
  const key = String(type || '').toLowerCase();
  const src = ANIMAL_SRC[key];
  if (!src) return null;
  const riskColor = RISK_COLORS[DETECTION_RISK_MAP[type] || DETECTION_RISK_MAP[key.charAt(0).toUpperCase() + key.slice(1)]] || 'currentColor';
  const fill = color || riskColor;
  const mask = `url(${src}) no-repeat center / contain`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: fill,
        WebkitMask: mask,
        mask,
        verticalAlign: '-0.15em',
      }}
    />
  );
}
