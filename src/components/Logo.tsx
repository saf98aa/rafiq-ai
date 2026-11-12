import { useId } from 'react';

// Rafiq Flow symbol (Rafiq_AI_ID_Brand_Identity_Guide, Concept 02):
// an abstract mark — a dot (the person / start of the journey) above a flowing, rounded path
// (companionship and the journey). No cross, crescent or conventional medical symbol.
// Palette D: Royal Purple #4B1D7A → Lavender #9B6FE0 → Soft Rose #F49BB3, warm accent Peach #FFC79E.
export function Mark({ size = 40, animated = false, light = false }: { size?: number; animated?: boolean; light?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={animated ? 'mark mark--anim' : 'mark'}>
      <defs>
        <linearGradient id={`m${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={light ? '#FFFFFF' : '#4B1D7A'} />
          <stop offset="0.55" stopColor={light ? '#E9DCFF' : '#9B6FE0'} />
          <stop offset="1" stopColor={light ? '#FFD9E3' : '#F49BB3'} />
        </linearGradient>
        <linearGradient id={`w${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F49BB3" />
          <stop offset="1" stopColor="#FFC79E" />
        </linearGradient>
      </defs>
      <path className="mark__path" pathLength={1} d="M12 44C21 30 33 24 49 25" fill="none" stroke={`url(#m${id})`} strokeWidth="8" strokeLinecap="round" />
      <path className="mark__path" pathLength={1} d="M9 54C24 44 40 41 56 39" fill="none" stroke={`url(#w${id})`} strokeWidth="5.5" strokeLinecap="round" opacity={light ? 0.95 : 0.9} />
      <circle cx="44.5" cy="12.5" r="6.5" fill={`url(#w${id})`} />
    </svg>
  );
}

/** Horizontal lockup: symbol + Arabic wordmark «رفيق» + Rafiq AI. */
export default function Logo({ light = false, size = 30 }: { light?: boolean; size?: number }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`} dir="ltr">
      <Mark size={size} light={light} />
      <span className="logo__ar" lang="ar">
        رفيق
      </span>
      <span className="logo__sep" />
      <span className="logo__en">Rafiq AI</span>
    </span>
  );
}
