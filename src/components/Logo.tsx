import { useId } from 'react';

// The Rafiq mark: a soft, rounded medical cross drawn as a continuous outline,
// matching the approved identity sheet.
export function Mark({ size = 40, animated = false, light = false }: { size?: number; animated?: boolean; light?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={animated ? 'mark mark--anim' : 'mark'}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light ? '#BDF4FA' : '#22C3D6'} />
          <stop offset="1" stopColor={light ? '#FFFFFF' : '#0B6E8E'} />
        </linearGradient>
      </defs>
      <path
        className="mark__path"
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth="8.5"
        strokeLinejoin="round"
        pathLength={1}
        d="M24 8h16a4 4 0 0 1 4 4v12h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H44v12a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V40H8a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4h12V12a4 4 0 0 1 4-4z"
      />
    </svg>
  );
}

export default function Logo({ light = false, size = 30 }: { light?: boolean; size?: number }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`} dir="ltr">
      <Mark size={size} light={light} />
      <span className="logo__ar">رفيق</span>
      <span className="logo__sep" />
      <span className="logo__en">Rafiq AI</span>
    </span>
  );
}
